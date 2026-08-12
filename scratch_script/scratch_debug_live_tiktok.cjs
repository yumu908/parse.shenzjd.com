const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

async function testLiveTikTok() {
  const shareUrl = "https://www.tiktok.com/@vicky_china_travel_guide/video/7659724653635587341?is_from_webapp=1&sender_device=pc";
  const videoId = "7659724653635587341";

  // Test 1: Web page
  try {
    console.log("Fetching TikTok Web page...");
    const res = await fetch(`https://www.tiktok.com/@vicky_china_travel_guide/video/${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml"
      }
    });
    console.log("Web page status:", res.status);
    const html = await res.text();

    const cleanText = html
      .replace(/\\u0026/g, "&")
      .replace(/\\u002F/gi, "/")
      .replace(/\\/g, "")
      .replace(/&amp;/g, "&");

    const primeMatches = cleanText.match(
      /https?:\/\/[^"'\s\\]*webapp-prime[^"'\s\\]*\/video\/tos\/[^"'\s\\]*(?:mime_type=video|\.mp4)[^"'\s\\]*/gi
    ) || [];

    console.log("Found webapp-prime matches:", primeMatches.length);
    primeMatches.forEach((m, i) => {
      console.log(`Match ${i+1}:`, m.substring(0, 160));
    });

    const cdnMatches = cleanText.match(
      /https?:\/\/[^"'\s\\]+(?:tiktokcdn|tiktokv|byteoversea)[^"'\s\\]*\/video\/tos\/[^"'\s\\]*(?:mime_type=video|\.mp4)[^"'\s\\]*/gi
    ) || [];

    console.log("Found tiktokcdn matches:", cdnMatches.length);
    cdnMatches.forEach((m, i) => {
      console.log(`CDN Match ${i+1}:`, m.substring(0, 160));
    });

  } catch (e) {
    console.log("Error fetching web page:", e.message);
  }
}

testLiveTikTok();
