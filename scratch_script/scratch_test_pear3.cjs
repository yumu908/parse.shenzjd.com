const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function testPear3(videoId) {
  console.log("\n=========================");
  console.log("Testing PearVideo videoId:", videoId);

  // 尝试 1: 直接抓取 HTML 提取 videoUrl
  const htmlUrl = `https://www.pearvideo.com/video_${videoId}`;
  console.log("Fetching HTML:", htmlUrl);
  try {
    const res = await fetch(htmlUrl, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(5000),
    });
    console.log("HTML status:", res.status);
    const html = await res.text();
    console.log("HTML len:", html.length);

    const titleMatch = html.match(/<h1 class="video-tt">(.*?)<\/h1>/s) || html.match(/<title>(.*?)<\/title>/i);
    const coverMatch = html.match(/poster="([^"]+)"/i) || html.match(/src="([^"]+?\.jpg)"/i);
    const mp4Match = html.match(/srcUrl="([^"]+)"/i) || html.match(/https?:[^\s"'<>]+?\.mp4[^\s"'<>]*/i);

    console.log("Found title:", titleMatch?.[1]?.replace(/_梨视频.*/, "").trim());
    console.log("Found cover:", coverMatch?.[1]);
    console.log("Found mp4:", mp4Match?.[1] || mp4Match?.[0]);
  } catch (e) {
    console.error("HTML error:", e.message);
  }

  // 尝试 2: 请求 videoStatus.jsp
  const mrd = (Math.random() + "").slice(2, 8);
  const statusUrl = `https://www.pearvideo.com/videoStatus.jsp?contId=${videoId}&mrd=0.${mrd}`;
  console.log("Fetching Status API:", statusUrl);
  try {
    const res = await fetch(statusUrl, {
      headers: {
        "User-Agent": UA,
        "Referer": `https://www.pearvideo.com/video_${videoId}`,
      },
      signal: AbortSignal.timeout(5000),
    });
    console.log("Status API http status:", res.status);
    const json = await res.json();
    console.log("Status API json:\n", JSON.stringify(json, null, 2));
  } catch (e) {
    console.error("Status API error:", e.message);
  }
}

testPear3("1807012");
