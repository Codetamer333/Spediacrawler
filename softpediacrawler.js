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
  await page.goto("https://en.softonic.com/");
  if (capturedHeaders["user-agent"]) {
    capturedHeaders["user-agent"] += " MyCustomUserAgentString";
  }
  await page.setExtraHTTPHeaders(capturedHeaders);
  const allAppsInfo = [];
  const categoryMappings = {
    // "AI Apps": [
    //   "https://en.softonic.com/windows/ai-audio:new-apps",
    //   "https://en.softonic.com/windows/ai-chat:new-apps",
    //   "https://en.softonic.com/windows/ai-coding:trending",
    //   "https://en.softonic.com/windows/ai-image-generator-editor:new-apps",
    //   "https://en.softonic.com/windows/ai-productivity:date",
    //   "https://en.softonic.com/windows/ai-video-generator-editor:date",
    //   "https://en.softonic.com/windows/ai-writing-assistant:date",
    // ],
    // "Browsers": [
    //   "https://en.softonic.com/windows/add-ons-tools:new-apps",
    //   "https://en.softonic.com/windows/web-browsers:new-apps",
    // ],
    // "Security & Privacy": [
    //   "https://en.softonic.com/windows/access-control:new-apps",
    //   "https://en.softonic.com/windows/ad-blockers:new-apps",
    //   "https://en.softonic.com/windows/anti-spam-anti-spy:new-apps",
    //   "https://en.softonic.com/windows/antivirus:new-apps",
    //   "https://en.softonic.com/windows/encryption:new-apps",
    //   "https://en.softonic.com/windows/firewalls:new-apps",
    //   "https://en.softonic.com/windows/keyloggers:new-apps",
    //   "https://en.softonic.com/windows/password-management:new-apps",
    //   "https://en.softonic.com/windows/vpn:new-apps",
    // ],
    // "Business & Productivity": [
    //   "https://en.softonic.com/windows/accounting:new-apps",
    //   "https://en.softonic.com/windows/agenda-calendars:new-apps",
    //   "https://en.softonic.com/windows/banking-atm:new-apps",
    //   "https://en.softonic.com/windows/calculators-converters:new-apps",
    //   "https://en.softonic.com/windows/document-management:new-apps",
    //   "https://en.softonic.com/windows/e-mail-clients:new-apps",
    //   "https://en.softonic.com/windows/finance:new-apps",
    //   "https://en.softonic.com/windows/office-suites:new-apps",
    //   "https://en.softonic.com/windows/personal-finance-management:new-apps",
    //   "https://en.softonic.com/windows/project-management:new-apps",
    //   "https://en.softonic.com/windows/remote-pc:new-apps",
    // ],
    // "Internet & Network": [
    //   "https://en.softonic.com/windows/download-managers:new-apps",
    //   "https://en.softonic.com/windows/file-sharing-peer-to-peer:new-apps",
    //   "https://en.softonic.com/windows/search-lookup-tools:new-apps",
    //   "https://en.softonic.com/windows/wifi:new-apps",
    // ],
    // "Multimedia": [
    //   "https://en.softonic.com/windows/audio:new-apps",
    //   "https://en.softonic.com/windows/burning:new-apps",
    //   "https://en.softonic.com/windows/graphic-design:new-apps",
    //   "https://en.softonic.com/windows/movies-tv:new-apps",
    //   "https://en.softonic.com/windows/music-radio:new-apps",
    //   "https://en.softonic.com/windows/photography:new-apps",
    //   "https://en.softonic.com/windows/streaming-videos:new-apps",
    //   "https://en.softonic.com/windows/video:new-apps",
    // ],
    // "Development & IT": [
    //   "https://en.softonic.com/windows/backup-cloud-storage:new-apps",
    //   "https://en.softonic.com/windows/database:new-apps",
    //   "https://en.softonic.com/windows/development-kits:new-apps",
    //   "https://en.softonic.com/windows/ftp-clients:new-apps",
    //   "https://en.softonic.com/windows/ides-source-editors:new-apps",
    //   "https://en.softonic.com/windows/manual-tutorials:new-apps",
    //   "https://en.softonic.com/windows/networking:new-apps",
    //   "https://en.softonic.com/windows/programming-languages:new-apps",
    //   "https://en.softonic.com/windows/remote-control:new-apps",
    //   "https://en.softonic.com/windows/servers:new-apps",
    //   "https://en.softonic.com/windows/web-development:new-apps",
    // ],
    // "Education & Reference": [
    //   "https://en.softonic.com/windows/books:new-apps",
    //   "https://en.softonic.com/windows/catalogs:new-apps",
    //   "https://en.softonic.com/windows/dictionaries:new-apps",
    //   "https://en.softonic.com/windows/e-readers:new-apps",
    //   "https://en.softonic.com/windows/geography:new-apps",
    //   "https://en.softonic.com/windows/languages-translation:new-apps",
    //   "https://en.softonic.com/windows/magazines-newspapers:new-apps",
    //   "https://en.softonic.com/windows/medicine:new-apps",
    //   "https://en.softonic.com/windows/science:new-apps",
    //   "https://en.softonic.com/windows/teaching-training:new-apps",
    // ],
    // "Lifestyle": [
    //   "https://en.softonic.com/windows/fashion-style:new-apps",
    //   "https://en.softonic.com/windows/food-drink:new-apps",
    //   "https://en.softonic.com/windows/grocery-lists:new-apps",
    //   "https://en.softonic.com/windows/health-fitness:new-apps",
    //   "https://en.softonic.com/windows/hobbies:new-apps",
    //   "https://en.softonic.com/windows/medical:new-apps",
    //   "https://en.softonic.com/windows/product-reviews-comparison:new-apps",
    //   "https://en.softonic.com/windows/shopping:new-apps",
    //   "https://en.softonic.com/windows/sports:new-apps",
    //   "https://en.softonic.com/windows/ticketing-service:new-apps",
    //   "https://en.softonic.com/windows/weather:new-apps",
    //   "https://en.softonic.com/windows/workout:new-apps",
    // ],
    // " Personalization": [
    //   "https://en.softonic.com/windows/cursors-fonts:new-apps",
    //   "https://en.softonic.com/windows/ringtones-sounds:new-apps",
    //   "https://en.softonic.com/windows/screen-lockers:new-apps",
    //   "https://en.softonic.com/windows/screen-savers:new-apps",
    //   "https://en.softonic.com/windows/themes:new-apps",
    //   "https://en.softonic.com/windows/wallpaper:new-apps",
    // ],
    // "Social & Communication": [
    //   "https://en.softonic.com/windows/blog:new-apps",
    //   "https://en.softonic.com/windows/chat-instant-messaging:new-apps",
    //   "https://en.softonic.com/windows/photo-video-sharing:new-apps",
    //   "https://en.softonic.com/windows/social-networking:new-apps",
    // ],
    // "Travel & Navigation": [
    //   "https://en.softonic.com/windows/maps-gps:new-apps",
    //   "https://en.softonic.com/windows/trip-management:new-apps",
    // ],
    // "Utilities & Tools ": [
    //   "https://en.softonic.com/windows/bar-code-scanning:new-apps",
    //   "https://en.softonic.com/windows/clocks-alarms:new-apps",
    //   "https://en.softonic.com/windows/data-recovery:new-apps",
    //   "https://en.softonic.com/windows/file-compression:new-apps",
    //   "https://en.softonic.com/windows/file-managers:new-apps",
    //   "https://en.softonic.com/windows/keyboards:new-apps",
    //   "https://en.softonic.com/windows/measurement:new-apps",
    //   "https://en.softonic.com/windows/printer-fax:new-apps",
    //   "https://en.softonic.com/windows/screen-capture:new-apps",
    // ],
    "Games for Windows": [
     // "https://en.softonic.com/windows/adventure:new-apps",
     // "https://en.softonic.com/windows/action:new-apps",
   //  "https://en.softonic.com/windows/arcade:new-apps",
    //  "https://en.softonic.com/windows/board:new-apps",
    //  "https://en.softonic.com/windows/card:new-apps",
    // "https://en.softonic.com/windows/casino:new-apps",
    //  "https://en.softonic.com/windows/educational:new-apps",
    //  "https://en.softonic.com/windows/family:new-apps",
     // "https://en.softonic.com/windows/family:new-apps",
     // "https://en.softonic.com/windows/music:new-apps",
    // "https://en.softonic.com/windows/puzzle:new-apps",
    //  "https://en.softonic.com/windows/racing:new-apps",
    //  "https://en.softonic.com/windows/role-playing:new-apps",
    //  "https://en.softonic.com/windows/simulation:new-apps",
    //  "https://en.softonic.com/windows/sport-games:new-apps",
    //  "https://en.softonic.com/windows/strategy:new-apps",
     // "https://en.softonic.com/windows/trivia:new-apps",
    //  "https://en.softonic.com/windows/utilities:new-apps",
     "https://en.softonic.com/windows/word",
    ],
  };
  function removeAllClasses(htmlString) {
    const dom = new JSDOM(htmlString, "text/html");
    const document = dom.window.document;
    const allElements = document.querySelectorAll("*");
    allElements.forEach((el) => {
      el.removeAttribute("class");
      el.removeAttribute("rel");
      el.removeAttribute("href");
      el.removeAttribute("data-meta");
      el.removeAttribute("target");
      el.removeAttribute("role");
      el.removeAttribute("onclick");
      el.removeAttribute("id");
      el.removeAttribute("viewBox");
      el.removeAttribute("xlink:href");
    });
    const modifiedHtmlString = dom.serialize();
    let cleanedHtmlString = modifiedHtmlString.replace(  /<\/?(html|head|body|div|svg|use)>|\n/g,"" );
    return cleanedHtmlString;
  }
  const hasExeFile = (folderPath) => {
    const files = fs.readdirSync(folderPath);
    return files.some((file) => file.endsWith(".exe"));
  };
  for (const [categoryName, urls] of Object.entries(categoryMappings)) {
    const categoryFolderPath = path.join(__dirname, "AppData", categoryName);
    if (!fs.existsSync(categoryFolderPath)) {
      fs.mkdirSync(categoryFolderPath, { recursive: true });
      console.log(`Created category directory at ${categoryFolderPath}`);
    } else {
      console.log(`Category directory already exists at ${categoryFolderPath}`);
    }
    for (const url of urls) {
      await page.goto(url, { waitUntil: "networkidle2" });
      const maxPageElement = await page.$("div.s-pagination__end a");
      let maxPageNumber = 1;
      if (maxPageElement) {
        maxPageNumber = await page.evaluate( (el) => parseInt(el.getAttribute("aria-label").match(/\d+$/)[0], 10),maxPageElement );
      }
      console.log(`Total number of pages for category ${categoryName}: ${maxPageNumber}` );
      for (let pageNumber = 1; pageNumber <= maxPageNumber; pageNumber++) {
        const pageUrl = pageNumber === 1 ? url : `${url}/${pageNumber}`;
        await page.goto(pageUrl, { waitUntil: "networkidle2" });
        const appLinks = await page.$$eval( "a.app-info.app-info--medium.app-info--prominent", (links) => links.map((a) => a.href) );
        for (const appLink of appLinks) {
          try {
            await page.goto(appLink, { waitUntil: "networkidle2" });
            const subcategoryItem = await page.$eval(  "ol > li:nth-child(4)", (li) => li.textContent );
            const appInfo = await page.evaluate(async () => {
              const title =document.querySelector("h1.app-header__name a")?.innerText.trim() || "No title";
              const License =document.querySelector(".app-specs__list > li:nth-child(1) p")?.innerText.trim() || "";
              const Version =document.querySelector(".app-specs__list > li:nth-child(2) p")?.innerText.trim() || "";
              const LatestUpdate =document.querySelector(".app-specs__list > li:nth-child(3) p")?.innerText.trim() || "";
              const Platform =document.querySelector(".app-specs__list > li:nth-child(4) p")?.innerText.trim() || "";
              const OS =document.querySelector(".app-specs__list > li:nth-child(5) p")?.innerText.trim() || "";
              const Language =document.querySelector(".app-specs__list > li:nth-child(6) p")?.innerText.trim() || "";
              const Downloads =document.querySelector(".app-specs__list > li:nth-child(7) p")?.innerText.trim() || "";
              const Developer =document.querySelector(".app-specs__list > li:nth-child(8)")?.innerText.trim() || "";
              const developerLink =document.querySelector(".app-specs__list > li:nth-child(8) a")?.href || "no dev link";
              const description =document.querySelector("article.editor-review")?.outerHTML ||  "No description";
              const imageLinks = [document.querySelector( 
                "a.app-gallery__link img.app-gallery__cover" )?.src || "No image link",
                document.querySelector("ul.is-hidden > li:nth-child(1) a")?.href || "No image link",
                document.querySelector("ul.is-hidden > li:nth-child(2) a")?.href || "No image link",
                document.querySelector("ul.is-hidden > li:nth-child(3) a")?.href || "No image link",
              ];
              const imageLogo =document.querySelector("a.app-header__logo img.app-icon")?.src || "No image link";
              const downloadLink =document.querySelector("div#cs2081-sticky-download-button a")?.href || "No download link";
              const specsArray = [
                `License: ${License}`,
                `Version: ${Version}`,
                `LatestUpdate: ${LatestUpdate}`,
                `Platform: ${Platform}`,
                `OS: ${OS}`,
                `Language: ${Language}`,
                `Downloads: ${Downloads}`,
              ];
              return { title, description,imageLogo,imageLinks, downloadLink, specsArray, Developer,developerLink,License };
            });
            const goodDescription = removeAllClasses(appInfo.description);
            appInfo.subcategoryItem = subcategoryItem;
            appInfo.descriptionG = goodDescription;
            allAppsInfo.push(appInfo);
            const categoryFolderPath = path.join(__dirname,"AppData",categoryName);
            const firstLetter = appInfo.title[0].toUpperCase();
            const alphabeticalFolderPath = path.join(categoryFolderPath,firstLetter);
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
            let downloadLink;
            if (appInfo.License == "Free") {
              const linkDeDownload = appInfo.downloadLink
              await page.goto(linkDeDownload, {
                waitUntil: "networkidle2",
                timeout: 100000,
              });
              const appLink2 = await page.evaluate(async () => {
                const directDownloadLinkSelector2 =document.querySelector( "section.download-module a.s-button-app.s-button-app--large.s-button-app--primary.button-download-direct.js-button-loading.js-launch-download.js-older-versions-button-download" )?.href || "no link";
                return { directDownloadLinkSelector2 };
              });
               downloadLink = appLink2.directDownloadLinkSelector2; 
               if (!hasExeFile(appFolderPath)){
                await downloadFile(downloadLink, appFolderPath);
                console.log(`Saved or updated app data for ${appInfo.title}`);
              } else {
                console.log(`App file for ${appInfo.title} already exists`);
              }
            }
          
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

async function downloadFile(fileUrl, outputPath) {
  try {
    const response = await axios({
      method: "get",
      url: fileUrl,
      responseType: "arraybuffer",
      headers: {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.6,fr;q=0.5,it;q=0.4,pt;q=0.3,tr;q=0.2,es;q=0.1,pl;q=0.1,la;q=0.1",
        "cache-control": "no-cache",
        " cookie": "_swo_pos=821; didomi_token=eyJ1c2VyX2lkIjoiMThlM2YwY2QtZGRiMi02ZWVmLWI1NDAtNTVhMTIxZDBhNmE4IiwiY3JlYXRlZCI6IjIwMjQtMDMtMTRUMjI6MTk6NTEuNjQzWiIsInVwZGF0ZWQiOiIyMDI0LTAzLTE0VDIyOjE5OjUzLjIyNloiLCJ2ZW5kb3JzIjp7ImVuYWJsZWQiOlsiYW1hem9uIiwiZ29vZ2xlIiwiYzpncmF2YXRhciIsImM6YmluZy1hZHMiLCJjOmludG93b3dpbi1xYXp0NXRHaSIsImM6ZGlkb21pIiwiYzpzdGlja3lhZHMiLCJjOmFkdmVydGlzaW5nY29tIiwiYzpob3RqYXIiLCJjOnRyZW1vci12aWRlbyIsImM6YmFpZHUtYWRzIiwiYzpnaWd5YS1jb3VudGVyIiwiYzpyYW1ibGVyIiwiYzpnaWd5YSIsImM6bWFya2V0byIsImM6c2VraW5kbyIsImM6YWRzdGlyIiwiYzpicmlnaHRyb2xsIiwiYzphZGFwdHYiLCJjOmFkc2NpZW5jZSIsImM6YWRpbmdvIiwiYzphZHZlcnNlcnZlIiwiYzpsa3FkIiwiYzplcS1hZHZlcnRpc2luZyIsImM6ZGlzcXVzIiwiYzpzeW5hY29yIiwiYzphZG5ldC1tZWRpYSIsImM6YWRuZXQtbWVkeWFuZXQiLCJjOmFkbW9iIiwiYzpmcm9zbW8tb3B0aW1pemVyIiwiYzppbmZlY3Rpb3VzLW1lZGlhIiwiYzp2aWRlb2xvZ3kiLCJjOnNtYXJ0YmlkLVBmRGFFcDhiIiwiYzpibHVla2FpIiwiYzpnb29nbGVhbmEtNFRYbkppZ1IiLCJjOmRpc3RyaWN0bS1CWUVBRUJtSCIsImM6c3lzdGVtMS1VVzk0eThmUiIsImM6cmV0YXJnZXRlZC1iUHcyM1dScSIsImM6d2VjYW50cmFjay1WVVFyQmFWTiIsImM6YWF4bGxjLTNFUnJMWG5RIiwiYzplbXhkaWdpdGEtRzNRUUJoNFEiLCJjOmViYXktc3RhdHMiLCJjOmFmZmlsaW5ldCIsImM6c2Nvb3RhLUVWQ3dyeUNkIiwiYzptaWNyb3NvZnQiXX0sInB1cnBvc2VzIjp7ImVuYWJsZWQiOlsiZ2VvX2FkcyIsImdlb2xvY2F0aW9uX2RhdGEiLCJkZXZpY2VfY2hhcmFjdGVyaXN0aWNzIl19LCJ2ZW5kb3JzX2xpIjp7ImVuYWJsZWQiOlsiYzppbmZlY3Rpb3VzLW1lZGlhIiwiYzp2aWRlb2xvZ3kiLCJjOnNtYXJ0YmlkLVBmRGFFcDhiIiwiYzplYmF5LXN0YXRzIiwiYzphZmZpbGluZXQiLCJjOnNjb290YS1FVkN3cnlDZCJdfSwidmVyc2lvbiI6MiwiYWMiOiJESk9CVUFFWUFMSUFYUUEyQUI2QUVxQU1BQVlnQk53Q2hnR2ZBUE5BZTRCN3dFT0FOSEFkVUE5VUNEWUVSd0lrZ1N4QWxxQlB3Q2lvRlZRTERnV3BBeEVCMDREcXdIWVFSVUFqTkJJUUNUVUV0WUozZ1VFQW9QQlRxQ3o0R1NZQS5BQUFBIn0=; euconsent-v2=CP7dmwAP7dmwAAHABBENArEsAP_gAELgAAiQI4IBYCRIQSEBMGhHAIIEYIAUwBhgIEAgAgAAgAABABoAIIwAECAgAAwAAAAAAAAAABIAAAAAAAAAAAAAAAAAAAAEAACQAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAABAAAgAAIQAIAAAwAAgAAIAAAAIAAAAAAAgAIAAAAAAAAAAAAAAAAgAAAAAEAAAAAABAEA7oAYAjgBlgDuAFJQAYAAiDUUgAwABEGodABgACINRCADAAEQagkAGAAIg1A.f_wACFwAAAAA; rv_google_ppid=30c97c61-0835-494b-a702-4ea1ed9c3d1c; persistent.fpmUserId=47fd1915-d824-4fbe-9048-560ca585c1bc; _adbs=JTdCJTIyaW5zdGFsbGVkJTIyJTNBZmFsc2UlMkMlMjJhY3RpdmUlMjIlM0FmYWxzZSUyQyUyMmxhc3RTdGF0ZSUyMiUzQWZhbHNlJTdE; _usr_orgn=direct; session.fpmSessionId=3e0122ab-5c78-4944-a739-9f51ccaafaf4; session.pv=5; rv_fp_pv=5; session.referrerPageId=app_download",
        "dnt": "1",
        "pragma": "no-cache",
        "sec-ch-ua": '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "Windows",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
      }
    });
    let filename = "";
    const disposition = response.headers['content-disposition'];
    if (disposition && disposition.indexOf('attachment') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }
    if (!filename) {
      console.log("Could not determine the filename. Skipping save.");
      return;
    }
    const finalPath = path.join(outputPath, filename);
    await fsPromises.writeFile(finalPath, response.data);
    console.log("File downloaded and saved to", finalPath);
  } catch (error) {
    console.error("Download failed:", error);
  }
}




