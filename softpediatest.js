const puppeteer = require("puppeteer-extra");
const fs = require("fs");
const path = require("path");
const axios = require("axios").default;
const fsPromises = require("fs").promises;
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { JSDOM } = require("jsdom");

puppeteer.use(StealthPlugin());
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    timeout: 100000,
    args: ['--window-size=1920,1080']
  });
  const page = await browser.newPage();
  // page.on("request", (request) => {
  //   if (request.resourceType() === "document") {
  //     capturedHeaders = request.headers();
  //     page.removeAllListeners("request");
  //   }
  // });
  // await page.goto("https://www.softpedia.com/");
  // if (capturedHeaders["user-agent"]) {
  //   capturedHeaders["user-agent"] += " MyCustomUserAgentString";
  // }
  // await page.setExtraHTTPHeaders(capturedHeaders);
  const allAppsInfo = [];
  const categoryMappings = {
    "Windows Apps": [
      "https://www.softpedia.com/get/Antivirus/",
      // "https://www.softpedia.com/get/Authoring-tools/",
      // "https://www.softpedia.com/get/CD-DVD-Tools/",
      // "https://www.softpedia.com/get/Compression-tools/",
      // "https://www.softpedia.com/get/Desktop-Enhancements/",
      // "https://en.softonic.com/windows/ai-video-generator-editor:date",
      // "https://en.softonic.com/windows/ai-writing-assistant:date",
    ]
  };
  // function removeAllClasses(htmlString) {
  //   const dom = new JSDOM(htmlString, "text/html");
  //   const document = dom.window.document;
  //   const allElements = document.querySelectorAll("*");
  //   allElements.forEach((el) => {
  //     el.removeAttribute("class");
  //     el.removeAttribute("rel");
  //     el.removeAttribute("href");
  //     el.removeAttribute("data-meta");
  //     el.removeAttribute("target");
  //     el.removeAttribute("role");
  //     el.removeAttribute("onclick");
  //     el.removeAttribute("id");
  //     el.removeAttribute("viewBox");
  //     el.removeAttribute("xlink:href");
  //   });
  //   const modifiedHtmlString = dom.serialize();
  //   let cleanedHtmlString = modifiedHtmlString.replace(  /<\/?(html|head|body|div|svg|use)>|\n/g,"" );
  //   return cleanedHtmlString;
  // }
//   const hasExeFile = (folderPath) => {
//     const files = fs.readdirSync(folderPath);
//     return files.some((file) => file.endsWith(".exe"));
//   };
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
      const maxPageElement = await page.$eval('a[title="Navigate to last page"]', (a) => a.textContent.trim());
      let maxPageNumber = 1;
      if (maxPageElement) {
          maxPageNumber = parseInt(maxPageElement.match(/\d+$/)[0], 10);
      }
      console.log(`Total number of pages for category ${categoryName}: ${maxPageNumber}` );
      for (let pageNumber = 1; pageNumber <= maxPageNumber; pageNumber++) {
        const pageUrl = pageNumber === 1 ? url : `${url}/index${pageNumber}.shtml`;
        console.log(`Crawling page ${pageUrl}`);
        await page.goto(pageUrl, { waitUntil: "networkidle2" });
        try {
          await page.waitForSelector('div.qc-cmp2-footer-overlay button.css-sw3gic', { timeout: 5000 });
          await page.click('div.qc-cmp2-footer-overlay button.css-sw3gic');
        } catch (error) {
          console.error("Privacy modal not found or failed to click Agree:", error);
        }
        const appLinks = await page.$$eval( "div.grid_48 h4.ln a", (links) => links.map((a) => a.href) );
        await page.close();
        for (const appLink of appLinks) {
          const softwarePage = await browser.newPage();
          try {
            await softwarePage.goto(appLink, { waitUntil: "networkidle2" });
            await softwarePage.setTime
            const subcategoryItem = await softwarePage.$eval(  "dl.pspec2015.mgtop_10 dd.ellip a", (a) => a.textContent );
            const Developer = await softwarePage.$eval('dl.pspec2015.mgtop_10 a[rel="nofollow"]', (a) => a.textContent.trim());
            console.log(Developer);
            const appInfo = await softwarePage.evaluate(async () => {
              const title =document.querySelector("div.grid_48 h1.grid_44")?.innerText.trim() || "No title";
              const License =document.querySelector("div.grid_15 dd.long span.bold")?.innerText.trim() || "PAID";
              const Version =document.querySelector("div.verspot h2.sanscond")?.innerText.trim() || "";
              // const LatestUpdate =document.querySelector(".app-specs__list > li:nth-child(3) p")?.innerText.trim() || "";
              // const Platform =document.querySelector(".app-specs__list > li:nth-child(4) p")?.innerText.trim() || "";
              const OS =document.querySelector("dl.pspec2015.mgtop_10 dd.multiline span")?.innerText.trim() || "";
              // const Language =document.querySelector(".app-specs__list > li:nth-child(6) p")?.innerText.trim() || "";
              // const Downloads =document.querySelector(".app-specs__list > li:nth-child(7) p")?.innerText.trim() || "";
              // const Subcategory =document.querySelector("dl.pspec2015.mgtop_10 dd.ellip a")?.innerText.trim() || "";
              const developerLink =document.querySelector("dl.pspec2015.mgtop_10 dt.upcase.hp a")?.href || "no dev link";
              // const description =document.querySelectorAll("p.mgbot_10")?.outerHTML ||  "No description";
              const descriptionElement =document.querySelectorAll("p.mgbot_10");
              const descriptionArray = Array.from(descriptionElement).map(element => element.outerHTML).join("") || "No description";
              // const imageLinks = [
              //   document.querySelector("a.app-gallery__link img.app-gallery__cover" )?.src || "No image link",
              //   document.querySelector("ul.is-hidden > li:nth-child(1) a")?.href || "No image link",
              //   document.querySelector("ul.is-hidden > li:nth-child(2) a")?.href || "No image link",
              //   document.querySelector("ul.is-hidden > li:nth-child(3) a")?.href || "No image link",
              // ];
              const imageLink = document.querySelector("div.scroverflow img" )?.src || "No image link"
              const imageLogo =document.querySelector("div.grid_48 img.h1icon")?.src || "No image link";
              // const downloadLink =document.querySelector("div#cs2081-sticky-download-button a")?.href || "No download link";
              const specsArray = [
                `License: ${License}`,
                `Version: ${Version}`,
                // `LatestUpdate: ${LatestUpdate}`,
                // `Platform: ${Platform}`,
                `OS: ${OS}`,
                // `Language: ${Language}`,
                // `Downloads: ${Downloads}`,
              ];
              return { title, descriptionArray,imageLogo, imageLink, developerLink, specsArray, License};
            });
            console.log(appInfo.title,  appInfo.imageLink, appInfo.imageLogo); 
            console.log(appInfo.developerLink);
            console.log(appInfo.specsArray);
            appInfo.Developer = Developer;
            appInfo.subcategoryItem = subcategoryItem;
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
            // let downloadLink;
            // if (appInfo.License == "Free") {
              // const linkDeDownload = `${appLink}#download`;
              // console.log(`Link de download: ${linkDeDownload}`);
              // await softwarePage.goto(linkDeDownload, {
              //   waitUntil: "networkidle2",
              //   timeout: 100000,
              // });
              // await softwarePage.waitForSelector('a[title="DOWNLOAD: External Mirror"]', {
              //   visible: true,  // Ensures the element is not only present but also visible
              //   timeout: 10000   // Waits up to 5000 milliseconds (optional, adjust as needed)
              // });
              await softwarePage.waitForSelector('#dlbtn1 a[itemprop="downloadUrl"]', { visible: true });
              await softwarePage.click('#dlbtn1 a[itemprop="downloadUrl"]');
              await softwarePage.waitForSelector('div.dllinkbox2', {
                visible: true,  
                timeout: 10000   
              });
              const downloadLink = await softwarePage.$eval('div.dllinkbox2 a', a => a.href);
              console.log(`Download link: ${downloadLink}`);
               if (!hasExeFile(appFolderPath)){
                await downloadFile(downloadLink, appFolderPath);
                console.log(`Saved or updated app data for ${appInfo.title}`);
              } else {
                console.log(`App file for ${appInfo.title} already exists`);
              }
            // }
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

// const delay = time => new Promise(resolve => setTimeout(resolve, time));
// async function downloadFile(fileUrl, outputPath) {
//   try {
//       console.log('Initiating download from URL:', fileUrl);
//       await delay(6000); // Ensure this delay is properly awaited
//       console.log('Making request after delay...');
//     const response = await axios({
//       method: "get",
//       url: fileUrl,
//       responseType: "arraybuffer",
//       headers: {
//         "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
//         "accept-language": "ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.6,fr;q=0.5,it;q=0.4,pt;q=0.3,tr;q=0.2,es;q=0.1,pl;q=0.1,la;q=0.1",
//         "accept-encoding": "gzip, deflate, br, zstd",
//         "cookie": "__SP33K=iuij9j4chl9f7lj9janvllptfo58patv", 
//         "euconsent-v2":"CP8i0cAP8i0cAAKA0AENAuEsAP_gAEPgACJwg1NX_H__bW9r8X73aft0eY1P99j77sQxBhfJE-4FzLvW_JwXx2ExNA36tqIKmRIEu3bBIQNlHJDUTVigaogVryDMakWcgTNKJ6BkiFMRO2dYCF5vmwtj-QKY5vp993dx2Det_dv83dzyz4VHn3a5_2e0WJCdA58tDfv9bROb-9IPd_58v4v0_F_rE2_eT1l_tevp7D8-ft87_XW-9_fff79LgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEQagCzDQqIA-yJCQg0DCKBACoKwgIoEAAAAJA0QEAJgwKdgYBLrCRACAFAAMEAIAAUZAAgAAEgAQiACQAoEAAEAgUAAIAAAgEADAwABgAsBAIAAQHQIUwIIFAsAEjMiIUwIAoEggJbKhBIAgQVwhCLPAggERMFAAACQAVgACAsFgMSSAlYkECXEG0AABAAgEEIFQik7MAQwJmy1V4Im0ZWkBaIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAACAA.dgAACfgAAAAA", 
//         "addtl_consent":" 1~43.3.9.6.9.13.6.4.15.9.5.2.11.1.7.1.3.2.10.33.4.6.9.17.2.9.20.7.20.5.20.9.2.1.4.11.29.4.14.9.3.10.6.2.9.6.6.9.8.33.5.3.1.27.1.17.10.9.1.8.6.2.8.3.4.146.65.1.17.1.18.25.35.5.18.9.7.41.2.4.18.24.4.9.6.5.2.14.18.7.3.2.2.8.28.8.6.3.10.4.20.2.17.10.11.1.3.22.16.2.6.8.6.11.6.5.33.11.8.11.28.12.1.5.2.17.9.6.40.17.4.9.15.8.7.3.12.7.2.4.1.7.12.13.22.13.2.6.8.10.1.4.15.2.4.9.4.5.4.7.13.5.15.17.4.14.10.15.2.5.6.2.2.1.2.14.7.4.8.2.9.10.18.12.13.2.18.1.1.3.1.1.9.7.2.16.5.19.8.4.8.5.4.8.4.4.2.14.2.13.4.2.6.9.6.3.2.2.3.5.2.3.6.10.11.6.3.19.8.3.3.1.2.3.9.19.26.3.10.13.4.3.4.6.3.3.3.3.1.1.1.6.11.3.1.1.11.6.1.10.5.8.3.2.2.4.3.2.2.7.15.7.14.1.3.3.4.5.4.3.2.2.5.5.1.2.9.7.9.1.5.3.7.10.11.1.3.1.1.2.1.3.2.6.1.12.8.1.3.1.1.2.2.7.7.1.4.3.6.1.2.1.4.1.1.4.1.1.2.1.8.1.7.4.3.3.3.5.3.15.1.15.10.28.1.2.2.12.3.4.1.6.3.4.7.1.3.1.4.1.5.3.1.3.4.1.5.2.3.1.2.2.6.2.1.2.2.2.4.1.1.1.2.2.1.1.1.1.2.1.1.1.2.2.1.1.2.1.2.1.7.1.7.1.1.1.1.2.1.4.2.1.1.9.1.6.2.1.6.2.3.2.1.1.1.2.5.2.4.1.1.2.2.1.1.7.1.2.2.1.2.1.2.3.1.1.2.4.1.1.1.5.1.3.6.4.5.5.4.1.2.3.1.4.3.2.2.3.1.1.1.1.1.11.1.3.1.1.2.2.1.6.3.3.5.2.7.1.1.2.5.1.9.5.1.3.1.8.4.5.1.9.1.1.1.2.1.1.1.4.2.13.1.1.3.1.2.2.3.1.2.1.1.1.2.1.3.1.1.1.1.2.4.1.5.1.2.4.3.10.2.9.7.2.2.1.3.3.1.6.1.2.5.1.1.2.6.4.2.1.200.200.100.100.200.400.100.100.100.400.1700.100.204.596.100.1000.800.500.400.200.200.500.1300.801.99.506.95.1399.1100.4402.1798.1400.1300.200.100.800.900.300",
//         "usprivacy":"1Y--", 
//         "cooknotif2018":"1",
//         "sec-ch-ua": '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
//         "sec-ch-ua-mobile": "?0",
//         "sec-ch-ua-platform": "Windows",
//         "sec-fetch-dest": "document",
//         "sec-fetch-mode": "navigate",
//         "sec-fetch-site": "same-origin",
//         "sec-fetch-user": "?1",
//         "upgrade-insecure-requests": "1",
//         "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
//       }
//     });
//     console.log('Response Status:', response.status);
//     console.log('Response Headers:', response.headers);
//     let filename = "";
//     const disposition = response.headers['content-disposition'];
//     console.log('Content-Disposition:', disposition);
//     if (disposition && disposition.indexOf('attachment') !== -1) {
//       const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
//       const matches = filenameRegex.exec(disposition);
//       if (matches != null && matches[1]) {
//         filename = matches[1].replace(/['"]/g, '');
//       }
//     }
//     if (!filename) {
//       console.log("Could not determine the filename. Skipping save.");
//       return;
//     }
//     const finalPath = path.join(outputPath, filename);
//     await fsPromises.writeFile(finalPath, response.data);
//     console.log("File downloaded and saved to", finalPath);
//   } catch (error) {
//     console.error("Download failed:", error);
//   }
// }

// async function downloadFile(initialUrl, outputPath) {
//   try {
//       // Make an initial request to the URL
//       console.log('Initiating download from URL:', initialUrl);
//       await delay(6000); // Ensure this delay is properly awaited
//       console.log('Making request after delay...');
//       const initialResponse = await axios({
//           method: "get",
//           url: initialUrl,
//           maxRedirects: 0, // Prevent axios from following redirects automatically
//           validateStatus: function (status) {
//               return status >= 200 && status < 400; // Accept all 2xx and 3xx status codes
//           }
//       }).catch(error => error.response);
//       console.log('Initial response status:', initialResponse.status);
//       // Check if there's a redirect to the actual file URL
//       if (initialResponse.status === 302 || initialResponse.status === 301) {
//           const fileUrl = initialResponse.headers['location']; // This should be the actual file URL
//           console.log("Redirected to", fileUrl);
//           // Now, download the file from the actual file URL
//           const fileResponse = await axios({
//               method: "get",
//               url: fileUrl,
//               responseType: "arraybuffer",
//           });

//           // Extract filename from the URL
//           const url = new URL(fileUrl);
//           let filename = url.pathname.split('/').pop();
//           filename = decodeURIComponent(filename); // Decode URL-encoded filename

//           if (!filename) {
//               console.log("Could not determine the filename. Skipping save.");
//               return;
//           }

//           const finalPath = path.join(outputPath, filename);
//           await fs.promises.writeFile(finalPath, fileResponse.data);
//           console.log("File downloaded and saved to", finalPath);
//       } else {
//           console.log("The initial request did not redirect to a file URL.");
//       }
//   } catch (error) {
//       console.error("Download failed:", error);
//   }
// }


