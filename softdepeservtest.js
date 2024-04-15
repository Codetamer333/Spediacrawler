const puppeteer = require("puppeteer-extra");
const fs = require("fs");
const path = require("path");
const axios = require("axios").default;
const fsPromises = require("fs").promises;
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    timeout: 100000,
    args:
    [
        '--no-sandbox',
        '--disable-setuid-sandbox'
    ]
  });
  const page = await browser.newPage();
  const allAppsInfo = [];
  const categoryMappings = {
    "Windows Apps": [
    //  "https://www.softpedia.com/get/Antivirus/",
    // "https://www.softpedia.com/get/Authoring-tools/",
     //  "https://www.softpedia.com/get/CD-DVD-Tools/",
     //  "https://www.softpedia.com/get/Compression-tools/",
     //  "https://www.softpedia.com/get/Desktop-Enhancements/",
      // 'https://www.softpedia.com/get/File-managers/',
    // 'https://www.softpedia.com/get/Gaming-Related/',
     "https://www.softpedia.com/get/Artificial-Intelligence-Generative-AI/",
     'https://www.softpedia.com/get/Internet/',
     'https://www.softpedia.com/get/IPOD-TOOLS/',
     'https://www.softpedia.com/get/Maps-GPS/',
     'https://www.softpedia.com/get/Mobile-Phone-Tools/',
     'https://www.softpedia.com/get/Multimedia/',
     'https://www.softpedia.com/get/Network-Tools/',
  
    ]
  };

  const hasExeFile = (folderPath) => {
    const files = fs.readdirSync(folderPath);
    return files.some((file) => file.endsWith(".exe"));
  };
  for (const [categoryName, urls] of Object.entries(categoryMappings)) {
    const categoryFolderPath = path.join(__dirname, "Downloads", categoryName);
    if (!fs.existsSync(categoryFolderPath)) {
      fs.mkdirSync(categoryFolderPath, { recursive: true });
      console.log(`Created category directory at ${categoryFolderPath}`);
    } else {
      console.log(`Category directory already exists at ${categoryFolderPath}`);
    }
    for (const url of urls) {
      await page.goto(url, { waitUntil: "networkidle2" });
    //   const maxPageElement = await page.$eval('a[title="Navigate to last page"]', (a) => a.textContent.trim());
      let maxPageNumber = 1;
      try {
        const maxPageElement = await page.$eval('a[title="Navigate to last page"]', a => a.textContent.trim());
        if (maxPageElement) {
            maxPageNumber = parseInt(maxPageElement.match(/\d+$/)[0], 10);
        }
      } catch (error) {
        console.error("Pagination element not found, defaulting to one page:", error);
      }
    //   if (maxPageElement) {
    //       maxPageNumber = parseInt(maxPageElement.match(/\d+$/)[0], 10);
    //   } else {
    //     maxPageNumber = 1;
    //   }
      console.log(`Total number of pages for category ${categoryName}: ${maxPageNumber}` );
      for (let pageNumber = 1; pageNumber <= maxPageNumber; pageNumber++) {
           const pageUrl = pageNumber === 1 ? url : `${url}index${pageNumber}.shtml`;
       // const pageUrl = `${url}index${pageNumber}.shtml`;
        console.log(`Crawling page ${pageUrl}`);
        await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
        try {
          await page.waitForSelector('div.qc-cmp2-footer-overlay button.css-sw3gic', { timeout: 5000 });
          await page.click('div.qc-cmp2-footer-overlay button.css-sw3gic');
        } catch (error) {
          console.error("Privacy modal not found or failed to click Agree:", error);
        }
        const appLinks = await page.$$eval( "div.grid_48 h4.ln a", (links) => links.map((a) => a.href) );
       // await page.close();
        for (const appLink of appLinks) {
          const softwarePage = await browser.newPage();
          try {
            await softwarePage.goto(appLink, { waitUntil: "networkidle2" });
            const subcategoryItem = await softwarePage.$eval(  "dl.pspec2015.mgtop_10 dd.ellip a", (a) => a.textContent );
            const Developer = await softwarePage.$eval('dl.pspec2015.mgtop_10 a[rel="nofollow"]', (a) => a.textContent.trim());
            const imageLinks = await softwarePage.$$eval('div.slide a', links => links.map(link => link.href));
            const appInfo = await softwarePage.evaluate(async () => {
              const title =document.querySelector("div.grid_48 h1.grid_44")?.innerText.trim() || "No title";
              const License =document.querySelector("div.grid_15 dd.long span.bold")?.innerText.trim() || "PAID";
              const Version =document.querySelector("div.verspot h2.sanscond")?.innerText.trim() || "";
              const LatestUpdate =document.querySelector("div.grid_48 span.datemodif")?.innerText.trim() || "";
              const OS =document.querySelector("dl.pspec2015.mgtop_10 dd.multiline span")?.innerText.trim() || "";
              const developerLink =document.querySelector("dl.pspec2015.mgtop_10 dt.upcase.hp a")?.href || "no dev link";
              const descriptionElement =document.querySelectorAll("p.mgbot_10");
              const descriptionArray = Array.from(descriptionElement).map(element => element.outerHTML).join("") || "No description";
              const imageLogo =document.querySelector("div.grid_48 img.h1icon")?.src || "No image link";
              const specsArray = [
                `License: ${License}`,
                `Version: ${Version}`,
                `LatestUpdate: ${LatestUpdate}`,
                `OS: ${OS}`,
                `Language: EN`,
              ];
              return { title, descriptionArray,imageLogo, developerLink, specsArray};
            });
            appInfo.Developer = Developer;
            appInfo.subcategoryItem = subcategoryItem;
            appInfo.imageLinks = imageLinks;
            allAppsInfo.push(appInfo);
            const subcategoryFolderPath = path.join(categoryFolderPath, appInfo.subcategoryItem);
            const firstLetter = appInfo.title[0].toUpperCase();
            const alphabeticalFolderPath = path.join(subcategoryFolderPath,firstLetter);
            if (!fs.existsSync(alphabeticalFolderPath)) {
              fs.mkdirSync(alphabeticalFolderPath, { recursive: true });
              console.log(`Created alphabetical directory at ${alphabeticalFolderPath}`);
            }
            const folderName = appInfo.title.replace(/[^\w\s]/gi, "");
            const appFolderPath = path.join(alphabeticalFolderPath, folderName);
            if (!fs.existsSync(appFolderPath)) {
              fs.mkdirSync(appFolderPath, { recursive: true });
            }
            const jsonFilePath = path.join(appFolderPath, `${folderName}.json`);
            if (!fs.existsSync(jsonFilePath)) {
              fs.writeFileSync(jsonFilePath,JSON.stringify(appInfo, null, 2),"utf8");
              console.log(`Created app data for ${appInfo.title} in ${jsonFilePath}`);
            } else {
              fs.unlinkSync(jsonFilePath);
              fs.writeFileSync( jsonFilePath,JSON.stringify(appInfo, null, 2),"utf8" );
              console.log(`Updated app data for ${appInfo.title} in ${jsonFilePath}`);
             }
              await softwarePage.waitForSelector('#dlbtn1 a[itemprop="downloadUrl"]', { visible: true });
              await softwarePage.click('#dlbtn1 a[itemprop="downloadUrl"]');
              await softwarePage.waitForSelector('div.dllinkbox2', {
                visible: true,  
                timeout: 10000   
              });
              const linkDeDownload = await softwarePage.$eval('div.dllinkbox2 a', a => a.href);
              await softwarePage.goto(linkDeDownload, { waitUntil: "networkidle2" });
              await softwarePage.waitForSelector('#manstart a[rel="nofollow"]', { visible: true });
              const trueDownloadLink = await softwarePage.$eval('#manstart a[rel="nofollow"]', (a) => a.href );
               if (!hasExeFile(appFolderPath)){
                await downloadFile(trueDownloadLink, appFolderPath);
                console.log(`Saved or updated app data for ${appInfo.title}`);
              } else {
                console.log(`App file for ${appInfo.title} already exists`);
              }
            await softwarePage.close();
          } catch (error) {
            console.error(`Failed to scrape ${appLink}: ${error}`);
            await softwarePage.close();
            continue;
           }
        }
      }
    }
  }
  await browser.close();
})();


async function downloadFile(fileUrl, outputPath) {
  try {
    const response = await axios({
      method: "get",
      url: fileUrl,
      responseType: "arraybuffer",
    });
    let filename = "installer.exe";
    const finalPath = path.join(outputPath, filename);
    await fsPromises.writeFile(finalPath, response.data);
    console.log("File downloaded and saved to", finalPath);
  } catch (error) {
    console.error("Download failed:", error);
  }
}




