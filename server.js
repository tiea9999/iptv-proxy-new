import express from "express";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 10000;

// หน้าแรกแสดงสถานะ server
app.get("/", (req, res) => {
  res.send("IPTV Proxy Server is running!");
});

// ตัวอย่าง proxy สำหรับ m3u8
app.get("/proxy", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing url parameter");

  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // ไปยัง URL ที่ส่งมา
    await page.goto(url, { waitUntil: "networkidle2" });

    // ดึง content ของหน้า (ปรับได้ตามต้องการ)
    const content = await page.content();

    await browser.close();
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

