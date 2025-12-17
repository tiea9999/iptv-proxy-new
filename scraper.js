import puppeteer from "puppeteer";
import fs from "fs";

const channels = [
  { name: "HBO", url: "https://lfbtv.com/doonunglive/channel/?code=bein1" },
  { name: "Cinemax", url: "https://lfbtv.com/doonunglive/channel/?code=bein2" },
  { name: "HBO Family", url: "https://lfbtv.com/doonunglive/channel/?code=bein3" },
  { name: "HBO Hits", url: "https://lfbtv.com/doonunglive/channel/?code=monomax1" }
];

async function fetchM3U8(ch) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  let m3u8Url = null;

  page.on("response", async res => {
    const url = res.url();
    if (url.endsWith(".m3u8")) {
      console.log(`[FOUND] ${ch.name}: ${url}`);
      m3u8Url = url;
    }
  });

  await page.goto(ch.url, { waitUntil: "networkidle2" });
  await page.waitForTimeout(10000); // รอสตรีมโหลด

  await browser.close();
  return m3u8Url;
}

(async () => {
  const results = [];
  for (const ch of channels) {
    const url = await fetchM3U8(ch);
    if (url) results.push({ name: ch.name, url });
  }
  fs.writeFileSync("channels.json", JSON.stringify(results, null, 2));
  console.log("Channels saved to channels.json");
})();
