const https = require("https");
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;
delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: "GET",
      headers: {
        "User-Agent": UA,
        "Referer": "https://m.weishi.qq.com/",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      family: 4,
      timeout: 5000,
    }, (res) => {
      console.log("Status:", res.statusCode);
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve({ status: res.statusCode, data }));
    });

    req.on("error", (e) => reject(e));
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
    req.end();
  });
}

async function main() {
  const url = "https://m.weishi.qq.com/vise/share/index.html?wxplay=1&id=7mU7VjzWi1WS4t7kg";
  console.log("Fetching m.weishi.qq.com URL:", url);
  try {
    const { status, data } = await fetchUrl(url);
    console.log("Status:", status, "Data len:", data.length);
    console.log("Data snippet:", data.slice(0, 1000));

    const videoMatch = data.match(/https?:[^\s"'<>]+?\.mp4[^\s"'<>]*/g);
    console.log("MP4 links:", videoMatch);
  } catch (e) {
    console.error("Error:", e.message);
  }
}

main();
