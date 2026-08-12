const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;
delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;

const PC_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
const MOBILE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function testHaokanReal(vid) {
  console.log("\n=========================");
  console.log("Testing Haokan VID:", vid);

  // 1. 测试 H5/PC HTML 抓取
  for (const ua of [MOBILE_UA, PC_UA]) {
    const uaName = ua.includes("iPhone") ? "Mobile UA" : "PC UA";
    const htmlUrl = `https://haokan.baidu.com/v?vid=${vid}`;
    console.log(`\nFetching ${uaName}: ${htmlUrl}`);
    try {
      const res = await fetch(htmlUrl, {
        headers: { "User-Agent": ua }
      });
      console.log("Status:", res.status);
      const html = await res.text();
      console.log("HTML Len:", html.length);

      // 提取 JSON / playurl / video_src / src
      const playMatch =
        html.match(/"playurl"\s*:\s*"([^"]+)"/i) ||
        html.match(/"video_src"\s*:\s*"([^"]+)"/i) ||
        html.match(/"play_url"\s*:\s*"([^"]+)"/i) ||
        html.match(/<video[^>]+src="([^"]+)"/i) ||
        html.match(/https?:[^\s"'<>]+?\.mp4[^\s"'<>]*/i);

      if (playMatch) {
        console.log("Found Video URL:", playMatch[1] || playMatch[0]);
      } else {
        console.log("NO VIDEO MATCH! HTML Snippet around video:");
        const idx = html.indexOf("video") || html.indexOf("mp4");
        if (idx !== -1) {
          console.log(html.slice(Math.max(0, idx - 100), idx + 300));
        } else {
          console.log(html.slice(0, 500));
        }
      }
    } catch (e) {
      console.error("Fetch Error:", e.message);
    }
  }

  // 2. 测试 json 接口
  const jsonUrl = `https://haokan.baidu.com/v?_format=json&vid=${vid}`;
  try {
    const res = await fetch(jsonUrl, {
      headers: { "User-Agent": MOBILE_UA }
    });
    const json = await res.json();
    console.log("\nJSON errno:", json.errno, "data keys:", Object.keys(json.data || {}));
    if (json.data?.apiData?.curVideoMeta) {
      console.log("curVideoMeta keys:", Object.keys(json.data.apiData.curVideoMeta));
      console.log("curVideoMeta playurl:", json.data.apiData.curVideoMeta.playurl);
      console.log("curVideoMeta video_src:", json.data.apiData.curVideoMeta.video_src);
    }
  } catch (e) {
    console.error("JSON Fetch Error:", e.message);
  }
}

async function main() {
  await testHaokanReal("8681216155307678584");
  await testHaokanReal("6781836142492904140");
}

main();
