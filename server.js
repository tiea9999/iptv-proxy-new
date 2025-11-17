import express from "express";
import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Serve static files (index.html)
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Proxy route สำหรับทุกช่อง
app.get("/proxy", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing url parameter");

  const ua = req.query.ua || "Mozilla/5.0";
  const referer = req.query.referer || url;

  console.log(`[PROXY] Fetching URL: ${url}`);
  console.log(`[PROXY] UA: ${ua}, Referer: ${referer}`);

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.setUserAgent(ua);
    await page.setExtraHTTPHeaders({ Referer: referer });

    let targetM3U8 = null;

    page.on("response", async (response) => {
      const rUrl = response.url();
      if (rUrl.endsWith(".m3u8")) {
        targetM3U8 = rUrl;
        console.log(`[PROXY] Found m3u8: ${targetM3U8}`);
      }
    });

    // เปิดหน้า live + timeout 30s
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await browser.close();

    if (!targetM3U8) {
      console.warn(`[PROXY] No m3u8 found for ${url}`);
      return res.status(404).send("No m3u8 found");
    }

    // redirect ไปที่ไฟล์ .m3u8
    res.redirect(targetM3U8);
  } catch (err) {
    console.error(`[PROXY] Error fetching URL: ${url}`, err);
    res.status(500).send("Error fetching URL: " + err.message);
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
