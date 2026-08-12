const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

async function test() {
  const url = "https://v.kuaishou.com/f/X2g0SFSzOCubNML";
  console.log("Fetching url:", url);
  const resp = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
    },
    redirect: "follow"
  });
  console.log("Response status:", resp.status, "URL:", resp.url);
  const html = await resp.text();
  console.log("HTML length:", html.length);

  const mp4s = html.match(/https?:\/\/[^"'\s\\]+\.mp4[^"'\s\\]*/gi) || [];
  const m3u8s = html.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/gi) || [];

  console.log("MP4s found:", mp4s.slice(0, 5));
  console.log("M3U8s found:", m3u8s.slice(0, 5));
}

test();
