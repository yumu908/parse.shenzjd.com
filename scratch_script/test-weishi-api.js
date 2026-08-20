const https = require('https');

function fetchWeishiApi(feedId) {
  return new Promise((resolve) => {
    const url = `https://h5.weishi.qq.com/webapp/json/weishi/WnsFeedDetail?g_tk=&feedid=${feedId}`;
    https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15",
        "Referer": "https://h5.weishi.qq.com/"
      }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    }).on("error", err => resolve({ error: err.message }));
  });
}

async function run() {
  const testId = "7mU7VjzWi1WS4t7kg";
  console.log("Testing Weishi WnsFeedDetail API for id:", testId);
  const r = await fetchWeishiApi(testId);
  console.log("Status:", r.status);
  console.log("Body snippet:", r.body?.slice(0, 500) || r.error);
}

run();
