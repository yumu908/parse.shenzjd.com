const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const MOBILE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function testXpcApi(articleId) {
  console.log("\n=========================");
  console.log("Testing Xinpianchang Article ID:", articleId);

  const apiUrls = [
    `https://mod-api.xinpianchang.com/v2/article/${articleId}?app_key=61a60037a34e0`,
    `https://mod-api.xinpianchang.com/v2/article/${articleId}`,
    `https://n-api.xinpianchang.com/mod/v1/post/${articleId}`,
    `https://openapi-v2.xinpianchang.com/v2/article/${articleId}`,
    `https://www.xinpianchang.com/a${articleId}`,
  ];

  for (const url of apiUrls) {
    console.log("\nFetching URL:", url);
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": MOBILE_UA,
          "Referer": "https://www.xinpianchang.com/",
          "Accept": "application/json, text/plain, */*",
        }
      });
      console.log("Status:", res.status);
      const text = await res.text();
      console.log("Response len:", text.length);

      try {
        const json = JSON.parse(text);
        console.log("JSON keys:", Object.keys(json));
        if (json.data) {
          console.log("JSON data keys:", Object.keys(json.data));
          const videoUrl = json.data?.video?.content?.progressive?.[0]?.url || json.data?.video_url || json.data?.videoUrl;
          console.log("Found Video URL:", videoUrl);
        }
      } catch {
        console.log("Response snippet (HTML):", text.slice(0, 300));
      }
    } catch (e) {
      console.error("Fetch Error:", e.message);
    }
  }
}

async function main() {
  await testXpcApi("13777600");
  await testXpcApi("13776982");
}

main();
