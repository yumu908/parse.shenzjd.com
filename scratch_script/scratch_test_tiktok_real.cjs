const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

async function testRealTikTokPage() {
  const videoId = "7659724653635587341";
  const url = `https://www.tiktok.com/@vicky_china_travel_guide/video/${videoId}`;

  console.log("Fetching Web page:", url);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
      }
    });
    console.log("Status:", res.status);
    const html = await res.text();
    console.log("HTML length:", html.length);

    // 检查是否有 __UNIVERSAL_DATA_FOR_REHYDRATION__
    const mData =
      html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(.*?)<\/script>/s) ||
      html.match(/<script id="SIGI_STATE"[^>]*>(.*?)<\/script>/s) ||
      html.match(/<script id="__FRONTEND_DEFAULT_SCOPE__"[^>]*>(.*?)<\/script>/s);

    if (mData?.[1]) {
      console.log("Found JSON rehydration script!");
      try {
        const root = JSON.parse(mData[1].trim());
        console.log("Root keys:", Object.keys(root));

        const item =
          root["__DEFAULT_SCOPE__"]?.["webapp-video-detail"]?.itemInfo?.itemStruct ||
          root["__DEFAULT_SCOPE__"]?.["webapp.video-detail"]?.itemInfo?.itemStruct ||
          Object.values(root.ItemModule || {})[0];

        if (item) {
          console.log("Found itemStruct!");
          console.log("playAddr:", item.video?.playAddr);
          console.log("downloadAddr:", item.video?.downloadAddr);
          if (item.video?.bitrate) {
            item.video.bitrate.forEach((b, idx) => {
              console.log(`Bitrate ${idx} PlayAddr UrlList:`, b.PlayAddr?.UrlList);
            });
          }
        }
      } catch (e) {
        console.log("JSON parse error:", e.message);
      }
    } else {
      console.log("No JSON rehydration script found. Searching for raw MP4 URLs in HTML:");
      const allUrls = html.matchAll(/https?:\/\/[^"'\s\\]+(?:webapp-prime|tiktokcdn|tiktokv)[^"'\s\\]+/gi);
      for (const u of allUrls) {
        console.log("Candidate:", u[0]);
      }
    }
  } catch (e) {
    console.log("Fetch error:", e.message);
  }
}

testRealTikTokPage();
