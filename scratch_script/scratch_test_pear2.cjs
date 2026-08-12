const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function testPear2(videoId) {
  console.log("\n=========================");
  console.log("Testing PearVideo videoId:", videoId);

  const mrd = (Math.random() + "").slice(2, 8);
  const reqUrl = `https://www.pearvideo.com/videoStatus.jsp?contId=${videoId}&mrd=${mrd}`;
  console.log("Requesting API:", reqUrl);

  try {
    const res = await fetch(reqUrl, {
      headers: {
        "User-Agent": UA,
        "Referer": `https://www.pearvideo.com/video_${videoId}`,
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
      },
      signal: AbortSignal.timeout(6000),
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
}

async function main() {
  await testPear2("1806992");
  await testPear2("1807012");
}

main();
