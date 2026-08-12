const https = require("https");
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

function fetchSixroom(vid) {
  return new Promise((resolve, reject) => {
    const path = `/coop/mobile/index.php?padapi=minivideo-watchVideo.php&av=3.0&encpass=&logiuid=&isnew=1&from=0&vid=${vid}`;
    const req = https.request({
      hostname: "v.6.cn",
      path: path,
      method: "GET",
      headers: {
        "User-Agent": UA,
        "Referer": `https://v.6.cn/minivideo/${vid}`,
        "Accept": "application/json, text/plain, */*",
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
    req.end();
  });
}

async function main() {
  console.log("Testing Sixroom native https request for vid 7457364...");
  try {
    const raw = await fetchSixroom("7457364");
    console.log("Raw response len:", raw.length);
    console.log("Raw response json:", raw);
  } catch (e) {
    console.error("Error:", e.message);
  }
}

main();
