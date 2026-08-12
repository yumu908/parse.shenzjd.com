const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function testSixroom(videoId) {
  console.log("\n=========================");
  console.log("Testing Sixroom videoId:", videoId);

  // 1. 测试 coop mobile API
  const apiUrl = `https://v.6.cn/coop/mobile/index.php?padapi=minivideo-watchVideo.php&av=3.0&encpass=&logiuid=&isnew=1&from=0&vid=${videoId}`;
  console.log("Requesting API:", apiUrl);

  try {
    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent": UA,
        "Referer": `https://v.6.cn/minivideo/${videoId}`,
      }
    });

    console.log("Status:", res.status);
    const json = await res.json();
    console.log("JSON response:\n", JSON.stringify(json, null, 2).slice(0, 1000));
  } catch (e) {
    console.error("API Fetch Error:", e.message);
  }

  // 2. 测试 HTML 抓取
  const htmlUrl = `https://v.6.cn/minivideo/${videoId}`;
  console.log("\nRequesting HTML:", htmlUrl);
  try {
    const res = await fetch(htmlUrl, {
      headers: { "User-Agent": UA }
    });
    console.log("HTML Status:", res.status);
    const html = await res.text();
    console.log("HTML len:", html.length);

    const videoMatch =
      html.match(/"playurl"\s*:\s*"([^"]+)"/i) ||
      html.match(/"mp4"\s*:\s*"([^"]+)"/i) ||
      html.match(/<video[^>]+src="([^"]+)"/i) ||
      html.match(/https?:[^\s"'<>]+?\.mp4[^\s"'<>]*/i);

    console.log("Found Video URL in HTML:", videoMatch?.[1] || videoMatch?.[0]);
  } catch (e) {
    console.error("HTML Fetch Error:", e.message);
  }
}

async function main() {
  await testSixroom("7457364");
}

main();
