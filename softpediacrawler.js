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
  });
  const page = await browser.newPage();
  page.on("request", (request) => {
    if (request.resourceType() === "document") {
      capturedHeaders = request.headers();
      page.removeAllListeners("request");
    }
  });
  await page.goto("https://www.softpedia.com/");
  if (capturedHeaders["user-agent"]) {
    capturedHeaders["user-agent"] += " MyCustomUserAgentString";
  }
  await page.setExtraHTTPHeaders(capturedHeaders);
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
      // const maxPageElement = await page.$eval('a[title="Navigate to last page"]', (a) => a.textContent.trim());
      let maxPageNumber = 1;
      // if (maxPageElement) {
      //     maxPageNumber = parseInt(maxPageElement.match(/\d+$/)[0], 10);
      // }
      console.log(`Total number of pages for category ${categoryName}: ${maxPageNumber}` );
      for (let pageNumber = 1; pageNumber <= maxPageNumber; pageNumber++) {
        const pageUrl = pageNumber === 1 ? url : `${url}/index${pageNumber}.shtml`;
        console.log(`Crawling page ${pageUrl}`);
        await page.goto(pageUrl, { waitUntil: "networkidle2" });
        const appLinks = await page.$$eval( "div.grid_48 h4.ln a", (links) => links.map((a) => a.href) );
        for (const appLink of appLinks) {
          try {
            await page.goto(appLink, { waitUntil: "networkidle2" });
            const subcategoryItem = await page.$eval(  "dl.pspec2015.mgtop_10 dd.ellip a", (a) => a.textContent );
            const Developer = await page.$eval('dl.pspec2015.mgtop_10 a[rel="nofollow"]', (a) => a.textContent.trim());
            console.log(Developer);
            const appInfo = await page.evaluate(async () => {
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
              const linkDeDownload = `${appLink}#download`;
              console.log(`Link de download: ${linkDeDownload}`);
              await page.goto(linkDeDownload, {
                waitUntil: "networkidle2",
                timeout: 100000,
              });
              const downloadLink = await page.$eval('a[title="DOWNLOAD: External Mirror"]', (a) => a.href );
              console.log(`Download link: ${downloadLink}`);
            //   const appLink2 = await page.evaluate(async () => {
            //     const directDownloadLinkSelector2 =document.querySelector( "section.download-module a.s-button-app.s-button-app--large.s-button-app--primary.button-download-direct.js-button-loading.js-launch-download.js-older-versions-button-download" )?.href || "no link";
            //     return { directDownloadLinkSelector2 };
            //   });
            //    downloadLink = appLink2.directDownloadLinkSelector2; 
              //  if (!hasExeFile(appFolderPath)){
              //   await downloadFile(downloadLink, appFolderPath);
              //   console.log(`Saved or updated app data for ${appInfo.title}`);
              // } else {
              //   console.log(`App file for ${appInfo.title} already exists`);
              // }
            // }
          
          } catch (error) {
            console.error(`Failed to scrape ${appLink}: ${error}`);
            continue;
           }
        }
      }
    }
  }
  await browser.close();
})();

// async function downloadFile(fileUrl, outputPath) {
//   try {
//     const response = await axios({
//       method: "get",
//       url: fileUrl,
//       responseType: "arraybuffer",
//       headers: {
//         "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
//         "accept-language": "ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.6,fr;q=0.5,it;q=0.4,pt;q=0.3,tr;q=0.2,es;q=0.1,pl;q=0.1,la;q=0.1",
//         "cache-control": "no-cache",
//         " cookie": "_swo_pos=821; didomi_token=eyJ1c2VyX2lkIjoiMThlM2YwY2QtZGRiMi02ZWVmLWI1NDAtNTVhMTIxZDBhNmE4IiwiY3JlYXRlZCI6IjIwMjQtMDMtMTRUMjI6MTk6NTEuNjQzWiIsInVwZGF0ZWQiOiIyMDI0LTAzLTE0VDIyOjE5OjUzLjIyNloiLCJ2ZW5kb3JzIjp7ImVuYWJsZWQiOlsiYW1hem9uIiwiZ29vZ2xlIiwiYzpncmF2YXRhciIsImM6YmluZy1hZHMiLCJjOmludG93b3dpbi1xYXp0NXRHaSIsImM6ZGlkb21pIiwiYzpzdGlja3lhZHMiLCJjOmFkdmVydGlzaW5nY29tIiwiYzpob3RqYXIiLCJjOnRyZW1vci12aWRlbyIsImM6YmFpZHUtYWRzIiwiYzpnaWd5YS1jb3VudGVyIiwiYzpyYW1ibGVyIiwiYzpnaWd5YSIsImM6bWFya2V0byIsImM6c2VraW5kbyIsImM6YWRzdGlyIiwiYzpicmlnaHRyb2xsIiwiYzphZGFwdHYiLCJjOmFkc2NpZW5jZSIsImM6YWRpbmdvIiwiYzphZHZlcnNlcnZlIiwiYzpsa3FkIiwiYzplcS1hZHZlcnRpc2luZyIsImM6ZGlzcXVzIiwiYzpzeW5hY29yIiwiYzphZG5ldC1tZWRpYSIsImM6YWRuZXQtbWVkeWFuZXQiLCJjOmFkbW9iIiwiYzpmcm9zbW8tb3B0aW1pemVyIiwiYzppbmZlY3Rpb3VzLW1lZGlhIiwiYzp2aWRlb2xvZ3kiLCJjOnNtYXJ0YmlkLVBmRGFFcDhiIiwiYzpibHVla2FpIiwiYzpnb29nbGVhbmEtNFRYbkppZ1IiLCJjOmRpc3RyaWN0bS1CWUVBRUJtSCIsImM6c3lzdGVtMS1VVzk0eThmUiIsImM6cmV0YXJnZXRlZC1iUHcyM1dScSIsImM6d2VjYW50cmFjay1WVVFyQmFWTiIsImM6YWF4bGxjLTNFUnJMWG5RIiwiYzplbXhkaWdpdGEtRzNRUUJoNFEiLCJjOmViYXktc3RhdHMiLCJjOmFmZmlsaW5ldCIsImM6c2Nvb3RhLUVWQ3dyeUNkIiwiYzptaWNyb3NvZnQiXX0sInB1cnBvc2VzIjp7ImVuYWJsZWQiOlsiZ2VvX2FkcyIsImdlb2xvY2F0aW9uX2RhdGEiLCJkZXZpY2VfY2hhcmFjdGVyaXN0aWNzIl19LCJ2ZW5kb3JzX2xpIjp7ImVuYWJsZWQiOlsiYzppbmZlY3Rpb3VzLW1lZGlhIiwiYzp2aWRlb2xvZ3kiLCJjOnNtYXJ0YmlkLVBmRGFFcDhiIiwiYzplYmF5LXN0YXRzIiwiYzphZmZpbGluZXQiLCJjOnNjb290YS1FVkN3cnlDZCJdfSwidmVyc2lvbiI6MiwiYWMiOiJESk9CVUFFWUFMSUFYUUEyQUI2QUVxQU1BQVlnQk53Q2hnR2ZBUE5BZTRCN3dFT0FOSEFkVUE5VUNEWUVSd0lrZ1N4QWxxQlB3Q2lvRlZRTERnV3BBeEVCMDREcXdIWVFSVUFqTkJJUUNUVUV0WUozZ1VFQW9QQlRxQ3o0R1NZQS5BQUFBIn0=; euconsent-v2=CP7dmwAP7dmwAAHABBENArEsAP_gAELgAAiQI4IBYCRIQSEBMGhHAIIEYIAUwBhgIEAgAgAAgAABABoAIIwAECAgAAwAAAAAAAAAABIAAAAAAAAAAAAAAAAAAAAEAACQAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAABAAAgAAIQAIAAAwAAgAAIAAAAIAAAAAAAgAIAAAAAAAAAAAAAAAAgAAAAAEAAAAAABAEA7oAYAjgBlgDuAFJQAYAAiDUUgAwABEGodABgACINRCADAAEQagkAGAAIg1A.f_wACFwAAAAA; rv_google_ppid=30c97c61-0835-494b-a702-4ea1ed9c3d1c; persistent.fpmUserId=47fd1915-d824-4fbe-9048-560ca585c1bc; _adbs=JTdCJTIyaW5zdGFsbGVkJTIyJTNBZmFsc2UlMkMlMjJhY3RpdmUlMjIlM0FmYWxzZSUyQyUyMmxhc3RTdGF0ZSUyMiUzQWZhbHNlJTdE; _usr_orgn=direct; session.fpmSessionId=3e0122ab-5c78-4944-a739-9f51ccaafaf4; session.pv=5; rv_fp_pv=5; session.referrerPageId=app_download",
//         "dnt": "1",
//         "pragma": "no-cache",
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
//     let filename = "";
//     const disposition = response.headers['content-disposition'];
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




