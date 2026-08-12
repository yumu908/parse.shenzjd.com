const https = require("https");
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const MOBILE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

function fetchHttps(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: "GET",
      headers: {
        "User-Agent": MOBILE_UA,
        "Referer": "https://www.xinpianchang.com/",
        "Accept": "application/json, text/plain, */*",
        "Connection": "keep-alive",
      },
      family: 4,
      timeout: 5000,
    }, (res) => {
      console.log("Status:", res.statusCode, "Headers:", res.headers["content-type"]);
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve(data));
    });

    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
    req.end();
  });
}

async function main() {
  const url1 = "https://mod-api.xinpianchang.com/v2/article/13777600?app_key=61a60037a34e0";
  console.log("Fetching url:", url1);
  try {
    const data = await fetchHttps(url1);
    console.log("Data len:", data.length);
    console.log("Data snippet:", data.slice(0, 1000));
  } catch (e) {
    console.error("Error:", e.message);
  }

  const url2 = "https://openapi-v2.xinpianchang.com/v2/article/13777600";
  console.log("\nFetching url 2:", url2);
  try {
    const data = await fetchHttps(url2);
    console.log("Data 2 len:", data.length);
    console.log("Data 2 snippet:", data.slice(0, 1000));
  } catch (e) {
    console.error("Error 2:", e.message);
  }
}

main();
