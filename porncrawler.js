const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");
const path = require("path");
const axios = require("axios").default;

puppeteer.use(StealthPlugin());
(async () => {

  const hasvideoFile = (folderPath) => {
    const files = fs.readdirSync(folderPath);
    return files.some((file) => file.endsWith(".mp4"));
  };
  let urls = [//'https://erothots.co/videos/hot',
   // 'https://erothots.co/videos/hot?p=1',
   // 'https://erothots.co/videos/hot?p=2',
   // 'https://erothots.co/videos/hot?p=3',
    //'https://erothots.co/videos/hot?p=4',
    // 'https://erothots.co/videos/hot?p=5',
    // 'https://erothots.co/videos/hot?p=6',
    // 'https://erothots.co/videos/hot?p=7',
     //'https://erothots.co/videos/hot?p=8',
   //  'https://erothots.co/videos/hot?p=9',
    // 'https://erothots.co/videos/hot?p=10',
    // 'https://erothots.co/videos/hot?p=11',
    // 'https://erothots.co/videos/hot?p=12',
     //'https://erothots.co/videos/hot?p=13',
    // 'https://erothots.co/videos/hot?p=14',
    // 'https://erothots.co/videos/hot?p=15',
    // 'https://erothots.co/videos/hot?p=16',
    // 'https://erothots.co/videos/hot?p=17',
    // 'https://erothots.co/videos/hot?p=18',
    // 'https://erothots.co/videos/hot?p=19',
   //  'https://erothots.co/videos/hot?p=20',
    // 'https://erothots.co/videos/hot?p=21',
     //'https://erothots.co/videos/hot?p=22',
    // 'https://erothots.co/videos/hot?p=23',
    // 'https://erothots.co/videos/hot?p=24',
     //'https://erothots.co/videos/hot?p=25',
    // 'https://erothots.co/videos/hot?p=26',
    // 'https://erothots.co/videos/hot?p=27',
    // 'https://erothots.co/videos/hot?p=28',
   // 'https://erothots.co/videos/hot?p=29',
    // 'https://erothots.co/videos/hot?p=30',
    // 'https://erothots.co/videos/hot?p=31',
    // 'https://erothots.co/videos/hot?p=32',
    // 'https://erothots.co/videos/hot?p=33',
     //'https://erothots.co/videos/hot?p=34',
    // 'https://erothots.co/videos/hot?p=35',
   //  'https://erothots.co/videos/hot?p=36',
     //'https://erothots.co/videos/hot?p=37',
   // 'https://erothots.co/videos/hot?p=38',
    // 'https://erothots.co/videos/hot?p=39',
    // 'https://erothots.co/videos/hot?p=40',
     //'https://erothots.co/videos/hot?p=41',
    // 'https://erothots.co/videos/hot?p=42',
    // 'https://erothots.co/videos/hot?p=43',
    // 'https://erothots.co/videos/hot?p=44',
    // 'https://erothots.co/videos/hot?p=45',
    // 'https://erothots.co/videos/hot?p=46',
    // 'https://erothots.co/videos/hot?p=47',
    // 'https://erothots.co/videos/hot?p=48',
    // 'https://erothots.co/videos/hot?p=49',
    // 'https://erothots.co/videos/hot?p=50',
    // 'https://erothots.co/videos/hot?p=51',
     //'https://erothots.co/videos/hot?p=52',
    // 'https://erothots.co/videos/hot?p=53',
    // 'https://erothots.co/videos/hot?p=54',
   //  'https://erothots.co/videos/hot?p=55',
    // 'https://erothots.co/videos/hot?p=56',
    // 'https://erothots.co/videos/hot?p=57',
    // 'https://erothots.co/videos/hot?p=58',
    // 'https://erothots.co/videos/hot?p=59',
    // 'https://erothots.co/videos/hot?p=60',
     //'https://erothots.co/videos/hot?p=61',
    // 'https://erothots.co/videos/hot?p=62',
    // 'https://erothots.co/videos/hot?p=63',
   // 'https://erothots.co/videos/hot?p=64',
    // 'https://erothots.co/videos/hot?p=65',
    // 'https://erothots.co/videos/hot?p=66',
    // 'https://erothots.co/videos/hot?p=67',
    // 'https://erothots.co/videos/hot?p=68',
     //'https://erothots.co/videos/hot?p=69',
    // 'https://erothots.co/videos/hot?p=70',
    // 'https://erothots.co/videos/hot?p=71',
    // 'https://erothots.co/videos/hot?p=72',
    // 'https://erothots.co/videos/hot?p=73',
    // 'https://erothots.co/videos/hot?p=74',
    // 'https://erothots.co/videos/hot?p=75',
    // 'https://erothots.co/videos/hot?p=76',
    // 'https://erothots.co/videos/hot?p=77',
     //'https://erothots.co/videos/hot?p=78',
    // 'https://erothots.co/videos/hot?p=79',
    // 'https://erothots.co/videos/hot?p=80',
    // 'https://erothots.co/videos/hot?p=81',
    // 'https://erothots.co/videos/hot?p=82',
     //'https://erothots.co/videos/hot?p=83',
    //'https://erothots.co/videos/hot?p=84',
    // 'https://erothots.co/videos/hot?p=85',
   //  'https://erothots.co/videos/hot?p=86',
   //  'https://erothots.co/videos/hot?p=87',
   //  'https://erothots.co/videos/hot?p=88',
    // 'https://erothots.co/videos/hot?p=89',
    // 'https://erothots.co/videos/hot?p=90',
    // 'https://erothots.co/videos/hot?p=91',
    // 'https://erothots.co/videos/hot?p=92',
    // 'https://erothots.co/videos/hot?p=93',
    // 'https://erothots.co/videos/hot?p=94',
    // 'https://erothots.co/videos/hot?p=95',
    // 'https://erothots.co/videos/hot?p=96',
    // 'https://erothots.co/videos/hot?p=97',
    // 'https://erothots.co/videos/hot?p=98',
   // 'https://erothots.co/videos/hot?p=99',
     //'https://erothots.co/videos/hot?p=100',
    // 'https://erothots.co/videos/hot?p=101',
   // 'https://erothots.co/videos/hot?p=102',
    // 'https://erothots.co/videos/hot?p=103',
    // 'https://erothots.co/videos/hot?p=104',
    // 'https://erothots.co/videos/hot?p=105',
    // 'https://erothots.co/videos/hot?p=106',
    // 'https://erothots.co/videos/hot?p=107',
    //'https://erothots.co/videos/hot?p=108',
    // 'https://erothots.co/videos/hot?p=109',
    // 'https://erothots.co/videos/hot?p=110',
     'https://erothots.co/videos/hot?p=111',
     'https://erothots.co/videos/hot?p=112',
     'https://erothots.co/videos/hot?p=113',
    // 'https://erothots.co/videos/hot?p=114',
    // 'https://erothots.co/videos/hot?p=115',
    // 'https://erothots.co/videos/hot?p=116',
    // 'https://erothots.co/videos/hot?p=117',
    // 'https://erothots.co/videos/hot?p=118',
    // 'https://erothots.co/videos/hot?p=119',
    // 'https://erothots.co/videos/hot?p=120',
    // 'https://erothots.co/videos/hot?p=121',
    // 'https://erothots.co/videos/hot?p=122',
    // 'https://erothots.co/videos/hot?p=123',
    // 'https://erothots.co/videos/hot?p=124',
    // 'https://erothots.co/videos/hot?p=125',
    // 'https://erothots.co/videos/hot?p=126',
    // 'https://erothots.co/videos/hot?p=127',
    // 'https://erothots.co/videos/hot?p=128',
    // 'https://erothots.co/videos/hot?p=129',
    // 'https://erothots.co/videos/hot?p=130',
    // 'https://erothots.co/videos/hot?p=131',
    // 'https://erothots.co/videos/hot?p=132',
    // 'https://erothots.co/videos/hot?p=133',
    // 'https://erothots.co/videos/hot?p=134',
    // 'https://erothots.co/videos/hot?p=135',
    // 'https://erothots.co/videos/hot?p=136',
    // 'https://erothots.co/videos/hot?p=137',
    // 'https://erothots.co/videos/hot?p=138',
    // 'https://erothots.co/videos/hot?p=139',
    // 'https://erothots.co/videos/hot?p=140',
    // 'https://erothots.co/videos/hot?p=141'
  ]

  for (const pageUrl of urls) {
    const browser = await puppeteer.launch({
      headless: true,
      timeout: 100000,
    });
    console.log(pageUrl);
    const page = await browser.newPage();
    page.on("request", (request) => {
      if (request.resourceType() === "document") {
        capturedHeaders = request.headers();
        page.removeAllListeners("request");
      }
    });
    await page.goto(pageUrl, { waitUntil: 'networkidle2' });
    //try {
    //  await page.goto(pageUrl, { waitUntil: 'networkidle2' });
    //  const confirmButtonA = "button.not-robot";
   //   await page.waitForSelector(confirmButtonA, { visible: true });
  //    if (confirmButtonA) {
  //      await page.click(confirmButtonA);
  //   }
      // const checkboxA = await page.evaluate(() => {
      //   // Using querySelector to find the checkbox input
      //   const checkbox = document.querySelector('label.ctp-checkbox-label span.ctp-label')?.innerText.trin() || "Element not found";
      //   // if (checkbox) {
      //   //   checkbox.click();
      //   // }
      //   return  checkbox; 
      // });
      // console.log(checkboxA.checkbox)
  //  } catch (error) {
    // console.error('Error:', error);
  //  }
    if (capturedHeaders["user-agent"]) {
      capturedHeaders["user-agent"] += " MyCustomUserAgentString";
    }
    await page.setExtraHTTPHeaders(capturedHeaders);
    try {
      const confirmButton = "div.confirm-btns button.is-18-enter";
      await page.waitForSelector(confirmButton, { visible: true });
      await page.click(confirmButton);
      const videoLinks = await page.$$eval("div.videos a.video", links => links.map(a => a.href));
      const downloadsFolder = path.join(__dirname, "Downloads");
      if (!fs.existsSync(downloadsFolder)) {
        fs.mkdirSync(downloadsFolder, { recursive: true });
        console.log(`Created category directory at ${downloadsFolder}`);
      } else {
        console.log(`Category directory already exists at ${downloadsFolder}`);
      }
      for (const videoLink of videoLinks) {
        try {
          await page.goto(videoLink, { waitUntil: "networkidle2" });
          const videoSrc = await page.evaluate(() => {
            const videoElement = document.querySelector('video.v-player source')?.getAttribute('src') || "No video";
            const title = document.querySelector('div.head-title span')?.innerText.trim() || "No Title";
            const description = document.querySelector('div.video-info p.normal.mrg-0')?.innerText.trim() || "No Description";
            return { videoElement, title, description };
          });
          const downloadLink = videoSrc.videoElement;
          const firstLetter = videoSrc.title[0].toUpperCase();
          const alphabeticalFolderPath = path.join(downloadsFolder, firstLetter);
          if (!fs.existsSync(alphabeticalFolderPath)) {
            fs.mkdirSync(alphabeticalFolderPath, { recursive: true });
            console.log(`Created alphabetical directory at ${alphabeticalFolderPath}`);
          }
          const folderName = videoSrc.title.replace(/[^\w\s]/gi, "");
          const videoFolderPath = path.join(alphabeticalFolderPath, folderName);
          if (!fs.existsSync(videoFolderPath)) {
            fs.mkdirSync(videoFolderPath, { recursive: true });
          }
          const jsonFilePath = path.join(videoFolderPath, `${folderName}.json`);
          if (!fs.existsSync(jsonFilePath)) {
            fs.writeFileSync(jsonFilePath, JSON.stringify(videoSrc, null, 2), "utf8");
            console.log(`Created app data for ${videoSrc.title} in ${jsonFilePath}`);
          } else {
            fs.unlinkSync(jsonFilePath);
            fs.writeFileSync(jsonFilePath, JSON.stringify(videoSrc, null, 2), "utf8");
            console.log(`Updated app data for ${videoSrc.title} in ${jsonFilePath}`);
          }
          if (!hasvideoFile(videoFolderPath)) {
            await downloadVideo(downloadLink, videoFolderPath).then(() => {
              console.log('Video downloaded successfully.');
            });
          } else {
            console.log('Video already exists in the folder.');
          }

        } catch (error) {
          console.error(`Failed to scrape video information: ${error}`);
        }
        continue
      }
    } catch (error) {
      console.error(`Failed to scrape app information: ${error}`);
    }
    await browser.close();
  }
})();

async function downloadVideo(videoUrl, outputPath) {
  try {
    if (!videoUrl) throw new Error('Video URL is null or invalid.');
    const response = await axios({
      method: 'get',
      url: videoUrl,
      responseType: 'stream'
    });
    // Extract filename from Content-Disposition header or fallback to a timestamped name
    let filename = 'downloaded_video_' + Date.now() + '.mp4'; // Default filename if Content-Disposition is not available
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const matches = contentDisposition.match(/filename="?([^"]+)"?/);
      if (matches && matches[1]) {
        filename = matches[1];
      }
    }
    // Ensure the filename does not contain invalid characters
    // filename = filename.replace(/[\x00-\x1f\x80-\x9f\/\\:\*\?"<>\|]/g, "_");
    const filePath = path.join(outputPath, filename);
    // Ensure the directory exists
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    // Write the video stream to a file
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filePath));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Download failed:', error);
  }
}
