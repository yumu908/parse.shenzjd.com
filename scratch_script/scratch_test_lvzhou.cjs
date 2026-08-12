const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
const https = require("https");

const url = "https://m.oasis.weibo.cn/v1/h5/share?uid=5781292544";

https.get(url, {
  headers: {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
  }
}, (res) => {
  console.log("Status:", res.statusCode);
  console.log("Location:", res.headers.location);
  let html = "";
  res.on("data", c => html += c);
  res.on("end", () => {
    console.log("HTML len:", html.length);
    console.log("HTML snippet:", html.slice(0, 1500));
    const videoMatch = html.match(/<video[^>]+src="([^"]+)"/i) || html.match(/"video_url"\s*:\s*"([^"]+)"/i) || html.match(/src="([^"]+?\.mp4[^"]*)"/i);
    console.log("Video match:", videoMatch?.[1]);
    const mp4s = html.match(/https?:[^\s"'<>]+?\.mp4[^\s"'<>]*/g);
    console.log("MP4s:", mp4s);
  });
}).on("error", (err) => {
  console.log("Error:", err.message);
});
