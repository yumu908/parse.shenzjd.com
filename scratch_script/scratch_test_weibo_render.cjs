const https = require("https");
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

function fetchWeiboH5Html(fid) {
  return new Promise((resolve, reject) => {
    const path = `/show?fid=${fid}`;
    const req = https.request({
      hostname: "video.weibo.com",
      port: 443,
      path: path,
      method: "GET",
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9",
      },
      family: 4,
      timeout: 5000,
    }, (res) => {
      console.log("Status:", res.statusCode, "Location:", res.headers.location);
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
  console.log("Testing native https GET to video.weibo.com for 1034:5314173463363635...");
  try {
    const res = await fetchWeiboH5Html("1034:5314173463363635");
    console.log("Response status:", res.status);
    console.log("Response len:", res.data.length);
    console.log("Snippet:\n", res.data.slice(0, 800));

    const renderMatch = res.data.match(/\$render_data\s*=\s*(\[\{.*?\}\]);/s);
    if (renderMatch?.[1]) {
      console.log("FOUND $render_data!");
      const json = JSON.parse(renderMatch[1]);
      console.log("Render data JSON:\n", JSON.stringify(json, null, 2).slice(0, 1000));
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}

main();
