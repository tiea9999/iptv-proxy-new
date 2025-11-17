import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";

const app = express();
app.use(cors());

const channelMap = {
  warnertv: "https://dookeela2.live/live-tv/warnertv",
  truemoviehits: "https://dookeela2.live/live-tv/truemoviehits",
  trueasianmore: "https://dookeela2.live/live-tv/trueasianmore",
  truefilmasia: "https://dookeela2.live/live-tv/truefilmasia",
  monomax1: "https://dookeela2.live/live-tv/monomax1"
};

app.get("/proxy", async (req, res) => {
  const channel = req.query.channel;
  const pageUrl = channelMap[channel];
  if (!pageUrl) return res.status(404).send("Channel not found");

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent("Mozilla/5.0");
    await page.goto(pageUrl, { waitUntil: "networkidle2" });

    const m3u8 = await page.evaluate(() => {
      const vid = document.querySelector("video");
      return vid?.src || null;
    });

    await browser.close();

    if (!m3u8) return res.status(500).send("m3u8 not found");

    res.redirect(m3u8);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching stream");
  }
});
