const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 10000;

app.get('/proxy', async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send('Missing url');

  const referer = req.query.referer || target;
  const ua = req.query.ua || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36';

  try {
    const response = await axios.get(target, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': ua,
        'Referer': referer
      },
      timeout: 10000
    });

    res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    res.status(response.status).send(response.data);

  } catch (err) {
    console.log(err.message);
    res.status(500).send('Error fetching stream');
  }
});

app.listen(PORT, () => {
  console.log(`Android TV Proxy running on port ${PORT}`);
});

