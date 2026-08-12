const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const https = require("https");

function getUrl(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
      }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on("error", (err) => {
      console.log("Req error:", err.message);
      resolve({ error: err });
    });
  });
}

async function run() {
  const code = "iXJXkjCg";
  const url2 = `https://qishui.douyin.com/s/${code}/`;
  console.log("2. Requesting:", url2);
  const r2 = await getUrl(url2);
  console.log("r2 status:", r2.status, "loc:", r2.headers?.location || "No loc");
}

run();
