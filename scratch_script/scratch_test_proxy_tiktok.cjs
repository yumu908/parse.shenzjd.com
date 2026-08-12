const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

async function testProxyTiktok() {
  const tiktokUrl = "https://v16-webapp-prime.us.tiktok.com/video/tos/useast5/tos-useast5-ve-0068-tx/ogNdIpJB7BA1zxCNMmi7BI1QhCCwAAAJEZf8Mi/?a=1988&bti=ODszNWYuMDE6&&bt=1528&ft=4KLxRMzm8Zmo00vCma4jVi_bQpWrKsd.&mime_type=video_mp4&rc=NzZkaTw1ODs2OWg8Z2YzZkBpajM3dnU5cndmPDMzZzczNEBeNC5eNi0wXzMxNmAxNTA0YSMxMV8tMmRzcTNhLS1kMS9zcw%3D%3D&vvpl=1&l=20260812154922F9D88B320601EE13EC3A&btag=e000b0000";

  console.log("Testing direct fetch to TikTok CDN URL:");
  try {
    const res = await fetch(tiktokUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.tiktok.com/"
      }
    });
    console.log("Direct status:", res.status);
    console.log("Content-Type:", res.headers.get("content-type"));
    console.log("Content-Length:", res.headers.get("content-length"));
  } catch (e) {
    console.log("Direct fetch error:", e.message);
  }

  console.log("\nTesting fetch WITHOUT Referer header:");
  try {
    const res2 = await fetch(tiktokUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    console.log("No Referer status:", res2.status);
    console.log("Content-Type:", res2.headers.get("content-type"));
  } catch (e) {
    console.log("No Referer fetch error:", e.message);
  }
}

testProxyTiktok();
