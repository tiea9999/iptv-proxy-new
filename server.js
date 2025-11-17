import express from "express";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 10000;

// หน้าแรกเช็กสถานะ server
app.get("/", (req, res) => {
  res.send("IPTV Proxy Server is running!");
});

// Proxy สำหรับ m3u8 / web content
app.get("/proxy", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing url parameter");

  try {
    // Optional header: user-agent, referer
    const ua = req.query.ua || "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
    const referer = req.query.referer || url;

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setUserAgent(ua);
    await page.setExtraHTTPHeaders({ Referer: referer });

    await page.goto(url, { waitUntil: "networkidle2" });

    // ดึง content ของหน้า
    const content = await page.content();
    await browser.close();

    // ส่งกลับ content
    res.set("Content-Type", "text/html");
    res.send(content);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching URL");
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});




