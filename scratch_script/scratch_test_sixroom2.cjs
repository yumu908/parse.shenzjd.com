const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function testSixroom2(videoId) {
  console.log("\n=========================");
  console.log("Testing Sixroom videoId:", videoId);

  // 1. 测试 https://m.6.cn/coop/mobile/index.php?padapi=minivideo-watchVideo.php&vid=${videoId}
  const urls = [
    `https://v.6.cn/coop/mobile/index.php?padapi=minivideo-watchVideo.php&av=3.0&encpass=&logiuid=&isnew=1&from=0&vid=${videoId}`,
    `https://m.6.cn/coop/mobile/index.php?padapi=minivideo-watchVideo.php&av=3.0&encpass=&logiuid=&isnew=1&from=0&vid=${videoId}`,
    `https://v.6.cn/minivideo/${videoId}`,
    `https://m.6.cn/v/${videoId}`,
  ];

  for (const url of urls) {
    console.log("\nFetching URL:", url);
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": UA,
          "Referer": "https://m.6.cn/",
        },
        signal: AbortSignal.timeout(6000),
      });

      console.log("Status:", res.status);
      const text = await res.text();
      console.log("Text len:", text.length);

      try {
        const json = JSON.parse(text);
        console.log("JSON flag:", json.flag, "msg:", json.msg);
        if (json.content) {
          console.log("Content playurl:", json.content.playurl);
          console.log("Content title:", json.content.title);
          console.log("Content picurl:", json.content.picurl);
        }
      } catch {
        console.log("HTML snippet:", text.slice(0, 300));
        const videoMatch =
          text.match(/"playurl"\s*:\s*"([^"]+)"/i) ||
          text.match(/<video[^>]+src="([^"]+)"/i) ||
          text.match(/https?:[^\s"'<>]+?\.mp4[^\s"'<>]*/i);
        if (videoMatch) {
          console.log("Found Video URL in HTML:", videoMatch[1] || videoMatch[0]);
        }
      }
    } catch (e) {
      console.error("Fetch Error:", e.message);
    }
  }
}

testSixroom2("7457364");
