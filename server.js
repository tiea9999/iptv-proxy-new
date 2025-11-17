import express from "express";
import fetch from "node-fetch"; // npm install node-fetch@3
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

// Proxy route แบบ direct fetch
app.get("/proxy", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing url parameter");

  const ua = req.query.ua || "Mozilla/5.0";
  const referer = req.query.referer || url;

  console.log(`[PROXY] Fetching URL: ${url}`);
  console.log(`[PROXY] UA: ${ua}, Referer: ${referer}`);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": ua,
        "Referer": referer
      },
      timeout: 30000 // 30s timeout
    });

    if (!response.ok) {
      console.warn(`[PROXY] Fetch failed: ${response.status}`);
      return res.status(response.status).send(`Fetch failed: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/vnd.apple.mpegurl")) {
      // ถ้าเจอ m3u8 → redirect ไปเลย
      res.redirect(url);
    } else {
      const text = await response.text();
      if (text.includes(".m3u8")) {
        // ตรวจหา .m3u8 link ใน body แล้ว redirect
        const match = text.match(/https?:\/\/.*?\.m3u8/g);
        if (match && match[0]) {
          console.log(`[PROXY] Found m3u8: ${match[0]}`);
          return res.redirect(match[0]);
        }
      }
      res.status(404).send("No m3u8 found");
    }
  } catch (err) {
    console.error(`[PROXY] Error fetching URL: ${url}`, err);
    res.status(500).send("Error fetching URL: " + err.message);
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
