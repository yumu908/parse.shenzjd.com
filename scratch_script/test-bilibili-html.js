const https = require('https');

function fetchUrl(url, headers) {
  return new Promise((resolve) => {
    https.get(url, { headers: { ...headers } }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    }).on("error", err => resolve({ error: err.message }));
  });
}

async function run() {
  const bvid = "BV1oLuY6CEHf";
  const headers = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    "Referer": "https://m.bilibili.com/",
  };

  console.log("1. Testing Bilibili Mobile HTML: https://m.bilibili.com/video/" + bvid);
  const r1 = await fetchUrl(`https://m.bilibili.com/video/${bvid}`, headers);
  console.log("Mobile HTML status:", r1.status);
  
  const stateMatch1 = r1.body.match(/window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});/);
  console.log("Mobile __INITIAL_STATE__ found:", !!stateMatch1);
  if (stateMatch1?.[1]) {
    try {
      const s = JSON.parse(stateMatch1[1]);
      console.log("Mobile title:", s.videoData?.title);
      console.log("Mobile pic:", s.videoData?.pic);
      console.log("Mobile owner:", s.videoData?.owner?.name);
    } catch (e) {
      console.log("JSON parse error for __INITIAL_STATE__:", e.message);
    }
  }

  const playinfoMatch1 = r1.body.match(/window\.__playinfo__\s*=\s*({[\s\S]*?});/);
  console.log("Mobile __playinfo__ found:", !!playinfoMatch1);

  console.log("\n2. Testing Bilibili PC HTML: https://www.bilibili.com/video/" + bvid);
  const r2 = await fetchUrl(`https://www.bilibili.com/video/${bvid}`, {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  });
  console.log("PC HTML status:", r2.status);
  const stateMatch2 = r2.body.match(/window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});/);
  console.log("PC __INITIAL_STATE__ found:", !!stateMatch2);
  const playinfoMatch2 = r2.body.match(/window\.__playinfo__\s*=\s*({[\s\S]*?});/);
  console.log("PC __playinfo__ found:", !!playinfoMatch2);
  if (playinfoMatch2?.[1]) {
    try {
      const p = JSON.parse(playinfoMatch2[1]);
      console.log("PC durl url:", p.data?.durl?.[0]?.url?.slice(0, 100));
    } catch {}
  }
}

run();
