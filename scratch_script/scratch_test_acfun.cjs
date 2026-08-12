const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

async function testAcfunParse(shareUrl) {
  console.log("Testing AcFun parse for:", shareUrl);
  try {
    const res = await fetch(shareUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15",
      },
      signal: AbortSignal.timeout(6000),
    });

    console.log("Status:", res.status);
    const html = await res.text();
    console.log("HTML len:", html.length);

    let videoUrl = "";
    const playInfoRe = /var playInfo\s*=\s*(.*?);/s;
    const pi = html.match(playInfoRe);
    if (pi?.[1]) {
      try {
        const o = JSON.parse(pi[1].trim());
        console.log("playInfo json keys:", Object.keys(o));
        console.log("streams:", JSON.stringify(o.streams, null, 2).slice(0, 800));
        videoUrl = o.streams?.[0]?.playUrls?.[0] || "";
      } catch (e) {
        console.error("JSON err:", e.message);
      }
    }

    // 备用抓取 m3u8 或 mp4
    if (!videoUrl) {
      const currentVideoInfoRe = /window\.pageInfo\s*=\s*(.*?);/s;
      const cvi = html.match(currentVideoInfoRe);
      if (cvi?.[1]) {
        console.log("pageInfo snippet:\n", cvi[1].slice(0, 500));
      }
    }

    console.log("Extracted Video URL:\n", videoUrl);
  } catch (e) {
    console.error("AcFun parse error:", e.message);
  }
}

testAcfunParse("https://www.acfun.cn/v/ac48634587");
