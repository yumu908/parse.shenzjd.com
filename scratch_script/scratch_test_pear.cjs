const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function testPear(videoId) {
  console.log("\n=========================");
  console.log("Testing PearVideo videoId:", videoId);

  // 1. 测试 videoStatus.jsp API
  const mrd = Math.floor(Date.now() / 1000);
  const reqUrl = `https://www.pearvideo.com/videoStatus.jsp?contId=${videoId}&mrd=${mrd}`;
  console.log("Requesting API:", reqUrl);

  try {
    const res = await fetch(reqUrl, {
      headers: {
        "Referer": `https://www.pearvideo.com/video_${videoId}`,
        "User-Agent": UA,
      },
    });

    console.log("Status:", res.status);
    const json = await res.json();
    console.log("API response JSON:\n", JSON.stringify(json, null, 2));

    const systemTime = json.systemTime;
    const srcUrl = json.videoInfo?.videos?.srcUrl;
    if (srcUrl && systemTime) {
      const realUrl = srcUrl.replace(systemTime, `cont-${videoId}`);
      console.log("REAL VIDEO URL:", realUrl);
    }
  } catch (e) {
    console.error("API Error:", e.message);
  }

  // 2. 测试 HTML 页面获取 title 和 cover
  const htmlUrl = `https://www.pearvideo.com/video_${videoId}`;
  console.log("\nRequesting HTML:", htmlUrl);
  try {
    const res = await fetch(htmlUrl, {
      headers: { "User-Agent": UA }
    });
    console.log("HTML status:", res.status);
    const html = await res.text();

    const titleMatch = html.match(/<h1 class="video-tt">(.*?)<\/h1>/s) || html.match(/<title>(.*?)<\/title>/i);
    console.log("Title found:", titleMatch?.[1]?.replace(/_梨视频.*/, "").trim());
  } catch (e) {
    console.error("HTML Error:", e.message);
  }
}

async function main() {
  await testPear("1806992");
  await testPear("1807012");
}

main();
