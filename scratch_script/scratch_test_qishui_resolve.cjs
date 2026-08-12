const https = require("https");
const dns = require("dns");

dns.lookup("music.douyin.com", { family: 4 }, (err, address) => {
  console.log("music.douyin.com IPv4:", address);
  if (address) {
    const req = https.request({
      hostname: address,
      port: 443,
      path: "/s/iXJXkjCg/",
      method: "GET",
      headers: {
        "Host": "qishui.douyin.com",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
      },
      servername: "qishui.douyin.com",
      rejectUnauthorized: false
    }, (res) => {
      console.log("Status:", res.statusCode);
      console.log("Location:", res.headers.location);
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        console.log("Body length:", data.length);
        const match = data.match(/track_id=(\d+)/) || data.match(/"track_id"\s*:\s*"?(\d+)"?/);
        console.log("Track ID:", match?.[1]);
      });
    });
    req.on("error", (e) => console.log("Request error:", e.message));
    req.end();
  }
});
