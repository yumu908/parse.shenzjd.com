const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const MobileUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function testPearM(videoId) {
  console.log("Testing PearVideo Mobile endpoints for vid:", videoId);

  const urls = [
    `https://m.pearvideo.com/video_${videoId}`,
    `https://www.pearvideo.com/videoStatus.jsp?contId=${videoId}&mrd=${Math.random()}`,
    `http://www.pearvideo.com/videoStatus.jsp?contId=${videoId}&mrd=${Math.random()}`,
  ];

  for (const url of urls) {
    console.log("\nFetching URL:", url);
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": MobileUA,
          "Referer": `https://www.pearvideo.com/video_${videoId}`,
          "X-Requested-With": "XMLHttpRequest",
        },
        signal: AbortSignal.timeout(5000),
      });

      console.log("Status:", res.status);
      const text = await res.text();
      console.log("Text len:", text.length);

      try {
        const json = JSON.parse(text);
        console.log("API JSON:\n", JSON.stringify(json, null, 2).slice(0, 500));
        const systemTime = json.systemTime;
        const srcUrl = json.videoInfo?.videos?.srcUrl;
        if (srcUrl && systemTime) {
          console.log("REAL MP4 VIDEO URL:\n", srcUrl.replace(systemTime, `cont-${videoId}`));
        }
      } catch {
        console.log("HTML snippet:", text.slice(0, 300));
        const mp4 = text.match(/https?:[^\s"'<>]+?\.mp4[^\s"'<>]*/i);
        if (mp4) {
          console.log("FOUND MP4 IN HTML:", mp4[0]);
        }
      }
    } catch (e) {
      console.error("Fetch Error:", e.message);
    }
  }
}

testPearM("1807012");
