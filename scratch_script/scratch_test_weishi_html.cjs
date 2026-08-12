const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function testWeishiPage() {
  const url = "https://video.weishi.qq.com/9UdU0HkD";
  console.log("Fetching:", url);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });
    console.log("Status:", res.status);
    console.log("Final URL:", res.url);
    const html = await res.text();
    console.log("HTML length:", html.length);
    console.log("HTML snippet:", html.slice(0, 2000));

    // 匹配视频流链接
    const videoMatches = html.match(/https?:[^\s"'<>]+?\.mp4[^\s"'<>]*/g) || [];
    console.log("MP4 links found in HTML:", videoMatches);

    // 匹配 window.__INITIAL_STATE__ 或 g_data 或 json
    const jsonMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});/);
    if (jsonMatch) {
      console.log("__INITIAL_STATE__ found:", jsonMatch[1].slice(0, 500));
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}

testWeishiPage();
