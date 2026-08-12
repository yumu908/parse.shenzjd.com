const http = require("http");
const https = require("https");
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function postWeiboComponent(fid) {
  return new Promise((resolve, reject) => {
    const postData = `data={\"Component_Play_Playinfo\":{\"oid\":\"${fid}\"}}`;
    const req = https.request({
      hostname: "weibo.com",
      port: 443,
      path: `/tv/api/component?page=/tv/show/${fid}`,
      method: "POST",
      headers: {
        "User-Agent": UA,
        "Referer": `https://weibo.com/tv/show/${fid}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData),
      },
      family: 4,
      timeout: 5000,
    }, (res) => {
      console.log("POST Status:", res.statusCode);
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
  console.log("Testing native https POST to weibo.com for 1034:5314173463363635...");
  try {
    const raw = await postWeiboComponent("1034:5314173463363635");
    console.log("Raw response len:", raw.length);
    console.log("Raw JSON:\n", raw.slice(0, 1000));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

main();
