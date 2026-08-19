const http = require('http');
const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15",
        "Referer": "https://v.douyu.com/"
      },
      timeout: 10000
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", err => resolve({ error: err.message }));
  });
}

async function run() {
  const vid = "yVmjvBAxgeNWqkNb";
  const api1 = `https://vmobile.douyu.com/video/getInfo?vid=${vid}`;
  const api2 = `https://v.douyu.com/api/video/info?vid=${vid}`;
  
  console.log("Testing API 1:", api1);
  const r1 = await fetchUrl(api1);
  console.log("R1:", r1.status, r1.body?.slice(0, 300) || r1.error);

  console.log("Testing API 2:", api2);
  const r2 = await fetchUrl(api2);
  console.log("R2:", r2.status, r2.body?.slice(0, 300) || r2.error);
}

run();
