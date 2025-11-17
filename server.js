const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 10000;

// หน้าแรกเช็กสถานะ server
app.get("/", (req, res) => {
  res.send("IPTV Proxy Server is running!");
});

// Proxy สำหรับ m3u8
app.get("/proxy", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing url parameter");

  try {
    // ตั้ง header optional
    const headers = {};
    if (req.query.ua) headers["User-Agent"] = req.query.ua;
    if (req.query.referer) headers["Referer"] = req.query.referer;

    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

    const data = await response.text();
    res.set("Content-Type", "application/vnd.apple.mpegurl");
    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching URL");
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});



