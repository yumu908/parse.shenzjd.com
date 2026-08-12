const https = require("https");
const dns = require("dns");

// 清理所有代理环境变量
delete process.env.http_proxy;
delete process.env.https_proxy;
delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;

dns.setDefaultResultOrder("ipv4first");

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

function getRedirectLocation(url) {
  return new Promise((resolve) => {
    const req = https.request(url, {
      method: "GET",
      headers: { "User-Agent": UA, "Host": new URL(url).hostname },
      family: 4,
      timeout: 5000,
    }, (res) => {
      console.log("Status:", res.statusCode);
      console.log("Location:", res.headers.location);
      resolve(res.headers.location || "");
    });

    req.on("error", (e) => {
      console.error("Req error:", e.message);
      resolve("");
    });
    req.on("timeout", () => {
      req.destroy();
      resolve("");
    });
    req.end();
  });
}

async function main() {
  const loc1 = await getRedirectLocation("https://video.weishi.qq.com/9UdU0HkD");
  console.log("Loc1:", loc1);

  const loc2 = await getRedirectLocation("https://video.weishi.qq.com/D3C21BTy");
  console.log("Loc2:", loc2);
}

main();
