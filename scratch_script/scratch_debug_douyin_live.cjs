const dns = require('dns');
try { dns.setDefaultResultOrder('ipv4first'); } catch {}

const MOBILE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "zh-CN,zh;q=0.9",
};

async function testDouyinLive() {
  const shareUrls = [
    "https://v.douyin.com/iLR8pQh9/",
    "https://v.douyin.com/4lyQ65pNh0A/",
    "7.11 04/23 l@m.Wp 01/24  https://v.douyin.com/k6Xf5sA/ 复制此链接，打开Douyin搜索，直接观看视频！"
  ];

  for (const rawUrl of shareUrls) {
    console.log("\n=================================");
    console.log("Testing raw URL:", rawUrl);

    // Extract URL
    const urlMatch = rawUrl.match(/(https?:\/\/[^\s]+)/);
    const url = urlMatch ? urlMatch[1] : rawUrl;
    console.log("Extracted URL:", url);

    const isShortUrl = url.includes("v.douyin.com");
    try {
      console.log("Fetching redirect: manual...");
      const start = Date.now();
      const manualRes = await fetch(url, {
        headers: MOBILE_HEADERS,
        redirect: "manual",
        signal: AbortSignal.timeout(isShortUrl ? 4000 : 6000),
      });
      console.log(`Manual status: ${manualRes.status}, time: ${Date.now() - start}ms`);
      const location = manualRes.headers.get("location");
      console.log("Location:", location);

      if (location) {
        // Now fetch location
        console.log("Fetching location HTML:", location);
        const locRes = await fetch(location, { headers: MOBILE_HEADERS, signal: AbortSignal.timeout(6000) });
        console.log("Location status:", locRes.status);
        const html = await locRes.text();
        console.log("HTML length:", html.length);
        console.log("Contains _ROUTER_DATA?", html.includes("_ROUTER_DATA"));
        console.log("Contains __APOLLO_STATE__?", html.includes("__APOLLO_STATE__"));
        console.log("Contains _RENDER_DATA?", html.includes("_RENDER_DATA"));
      }
    } catch (e) {
      console.log("Error:", e.message);
    }
  }
}

testDouyinLive();
