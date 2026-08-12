const http = require("http");
const https = require("https");
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function fetchGenvisitorHttp() {
  return new Promise((resolve, reject) => {
    const postData = "cb=gen_callback&fp=%7B%22os%22%3A%222%22%2C%22browser%22%3A%22Chrome122.0.0.0%22%2C%22platform%22%3A%22Win32%22%2C%22public_key%22%3A%22MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDDBc3e%22%7D";
    const req = http.request({
      hostname: "passport.weibo.com",
      port: 80,
      path: "/visitor/genvisitor2",
      method: "POST",
      headers: {
        "User-Agent": UA,
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData),
      },
      family: 4,
      timeout: 5000,
    }, (res) => {
      console.log("genvisitor2 HTTP status:", res.statusCode);
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
  console.log("Testing genvisitor2 over HTTP 80...");
  try {
    const raw = await fetchGenvisitorHttp();
    console.log("Raw response len:", raw.length);
    console.log("Raw data:\n", raw);
  } catch (e) {
    console.error("HTTP Error:", e.message);
  }
}

main();
