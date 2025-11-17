import express from "express";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("IPTV HLS Proxy is running!");
});

app.get("/proxy", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing url parameter");

  try {
    const ua = req.query.ua || "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
    const referer = req.query.referer || url;

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent(ua);
    await page.setExtraHTTPHeaders({ Referer: referer });

    let targetM3U8 = null;

    // intercept network response
    page.on("response", async (response) => {
      const requestUrl = response.url();
      if (requestUrl.endsWith(".m3u8")) {
        targetM3U8 = requestUrl; // capture real m3u8 URL
      }
    });

    await page.goto(url, { waitUntil: "networkidle2" });

    await browser.close();

    if (!targetM3U8) return res.status(404).send("No m3u8 found");

    // redirect client to real m3u8
    res.redirect(targetM3U8);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching URL");
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});





