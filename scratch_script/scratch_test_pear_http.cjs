const http = require("http");
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function fetchPearHttp(videoId) {
  return new Promise((resolve, reject) => {
    const mrd = Math.random();
    const path = `/videoStatus.jsp?contId=${videoId}&mrd=${mrd}`;
    const req = http.request({
      hostname: "www.pearvideo.com",
      port: 80,
      path: path,
      method: "GET",
      headers: {
        "User-Agent": UA,
        "Referer": `http://www.pearvideo.com/video_${videoId}`,
        "X-Requested-With": "XMLHttpRequest",
      },
      family: 4,
      timeout: 5000,
    }, (res) => {
      console.log("HTTP Status:", res.statusCode);
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve(data));
    });

    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
    req.end();
  });
}

async function main() {
  console.log("Testing PearVideo HTTP 80 request for 1807012...");
  try {
    const raw = await fetchPearHttp("1807012");
    console.log("Response len:", raw.length);
    console.log("Response data:\n", raw);

    const json = JSON.parse(raw);
    const systemTime = json.systemTime;
    const srcUrl = json.videoInfo?.videos?.srcUrl;
    if (srcUrl && systemTime) {
      const realUrl = srcUrl.replace(systemTime, `cont-1807012`);
      console.log("REAL MP4 VIDEO URL:\n", realUrl);
    }
  } catch (e) {
    console.error("HTTP Error:", e.message);
  }
}

main();
