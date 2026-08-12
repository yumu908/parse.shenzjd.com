const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

async function test() {
  const hashId = "ERALvEXNZRAW1Vw0";
  console.log("Fetching Douyu page for:", hashId);
  const resp = await fetch(`https://v.douyu.com/show/${hashId}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    }
  });
  const html = await resp.text();
  console.log("HTML length:", html.length);

  const m3u8s = html.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/gi) || [];
  const mp4s = html.match(/https?:\/\/[^"'\s\\]+\.mp4[^"'\s\\]*/gi) || [];

  console.log("M3U8s:", m3u8s);
  console.log("MP4s:", mp4s);
}

test();
