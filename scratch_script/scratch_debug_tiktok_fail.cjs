const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

async function debugTikTok() {
  const videoId = "7659724653635587341";
  const embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;
  console.log("Fetching Embed URL:", embedUrl);

  try {
    const res = await fetch(embedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });
    console.log("Embed Status:", res.status);
    const html = await res.text();
    console.log("Embed HTML Length:", html.length);

    // 检查所有含有 http 的字符串
    const matches = html.matchAll(/(https?:\\\/\\\/[^\s"'\\]+|https?:\/\/[^\s"'\\]+)/g);
    let count = 0;
    for (const m of matches) {
      const u = m[0].replace(/\\u0026/g, "&").replace(/\\u002F/gi, "/").replace(/\\/g, "");
      if (u.includes(".mp4") || u.includes("video/tos") || u.includes("playAddr")) {
        console.log(`Match ${++count}:`, u.substring(0, 150));
      }
    }
  } catch (e) {
    console.log("Error:", e.message);
  }
}

debugTikTok();
