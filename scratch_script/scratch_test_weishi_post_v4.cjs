const https = require("https");
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;
delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

function postWeishi(feedId) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ feedid: feedId });
    const req = https.request({
      hostname: "h5.weishi.qq.com",
      path: "/webapp/json/weishi/WSH5GetPlayPage",
      method: "POST",
      headers: {
        "User-Agent": UA,
        "Referer": "https://h5.weishi.qq.com/",
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
      family: 4,
      timeout: 5000,
    }, (res) => {
      console.log("Status:", res.statusCode);
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve(data));
    });

    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log("Testing POST WSH5GetPlayPage with IPv4...");
  try {
    const raw = await postWeishi("7mU7VjzWi1WS4t7kg");
    console.log("Raw response len:", raw.length);
    console.log("Raw response snippet:", raw.slice(0, 1000));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

main();
