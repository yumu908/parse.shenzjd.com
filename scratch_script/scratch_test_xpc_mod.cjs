const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const MOBILE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function testXpcMod(articleId) {
  console.log("\n=========================");
  console.log("Testing Xinpianchang Article ID:", articleId);

  // 1. 尝试 MOD API (移动端 App JSON API，不触发 PC 端 WAF 盾)
  const apiUrl = `https://mod-api.xinpianchang.com/v2/article/${articleId}?app_key=61a60037a34e0`;
  console.log("Fetching MOD API:", apiUrl);

  try {
    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent": MOBILE_UA,
        "Referer": "https://www.xinpianchang.com/",
        "Accept": "application/json, text/plain, */*",
      },
      signal: AbortSignal.timeout(6000),
    });

    console.log("Status:", res.status);
    const json = await res.json();
    console.log("JSON status_code:", json.status_code, "msg:", json.msg);
    if (json.data) {
      console.log("Title:", json.data.title);
      console.log("Author:", json.data.author?.userinfo?.username || json.data.user?.username);
      console.log("Cover:", json.data.cover);

      const videoUrl =
        json.data.video?.content?.progressive?.[0]?.url ||
        json.data.video?.content?.adaptive?.[0]?.url ||
        json.data.video_url ||
        json.data.videoUrl;

      console.log("Video URL:", videoUrl);
    }
  } catch (e) {
    console.error("MOD API Error:", e.message);
  }
}

async function main() {
  await testXpcMod("13777600");
  await testXpcMod("13776982");
}

main();
