const http = require("http");
const https = require("https");
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

function fetchWeiboHttp(fid) {
  return new Promise((resolve, reject) => {
    const path = `/show?fid=${fid}`;
    const req = http.request({
      hostname: "video.weibo.com",
      port: 80,
      path: path,
      method: "GET",
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      family: 4,
      timeout: 5000,
    }, (res) => {
      console.log("HTTP Status:", res.statusCode, "Location:", res.headers.location);
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve({ status: res.statusCode, data, location: res.headers.location }));
    });

    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
    req.end();
  });
}

async function main() {
  console.log("Testing Weibo HTTP 80 request for 1034:5314173463363635...");
  try {
    const res = await fetchWeiboHttp("1034:5314173463363635");
    console.log("Response status:", res.status);
    console.log("Response len:", res.data.length);
    const mp4Match = res.data.match(/https?:[^\s"'<>]+?\.mp4[^\s"'<>]*/i) || res.data.match(/"stream_url"\s*:\s*"([^"]+)"/i);
    console.log("Found mp4:", mp4Match?.[1] || mp4Match?.[0]);
  } catch (e) {
    console.error("HTTP Error:", e.message);
  }
}

main();
