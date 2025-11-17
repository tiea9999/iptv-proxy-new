





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
      executablePath: "/usr/bin/chromium-browser", // ใช้ Chromium ของ Render
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent(ua);
    await page.setExtraHTTPHeaders({ Referer: referer });

    let targetM3U8 = null;

    // intercept network response
