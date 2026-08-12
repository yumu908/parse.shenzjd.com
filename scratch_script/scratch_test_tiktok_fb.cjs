const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

async function testTiktok() {
  console.log("=== Testing TikTok Parsing ===");
  const testUrl = "https://www.tiktok.com/@tiktok/video/7107775747683912986";
  try {
    const res = await fetch(testUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });
    console.log("TikTok fetch status:", res.status);
    const html = await res.text();
    console.log("HTML length:", html.length);

    const mUniversal = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(.*?)<\/script>/s);
    if (mUniversal) {
      console.log("Found __UNIVERSAL_DATA_FOR_REHYDRATION__");
      try {
        const json = JSON.parse(mUniversal[1]);
        const itemStruct = json["__DEFAULT_SCOPE__"]?.["webapp.video-detail"]?.itemInfo?.itemStruct;
        if (itemStruct) {
          console.log("Title:", itemStruct.desc);
          console.log("Author:", itemStruct.author?.nickname);
          console.log("Video PlayAddr:", itemStruct.video?.playAddr);
        }
      } catch (e) {
        console.log("JSON parse error:", e.message);
      }
    }

    const mSig = html.match(/<script id="SIGI_STATE"[^>]*>(.*?)<\/script>/s);
    if (mSig) {
      console.log("Found SIGI_STATE");
    }

    // Try OEMBED
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(testUrl)}`;
    const oembedRes = await fetch(oembedUrl);
    if (oembedRes.ok) {
      const oembed = await oembedRes.json();
      console.log("OEmbed title:", oembed.title, "author:", oembed.author_name);
    }
  } catch (e) {
    console.log("TikTok error:", e.message);
  }
}

async function testFB() {
  console.log("\n=== Testing Facebook Parsing ===");
  const testUrl = "https://www.facebook.com/watch/?v=10159188448245729";
  try {
    const res = await fetch(testUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });
    console.log("FB fetch status:", res.status);
    const html = await res.text();
    console.log("HTML length:", html.length);

    const hdMatch = html.match(/"browser_native_hd_url"\s*:\s*"([^"]+)"/) || html.match(/"playable_url_quality_hd"\s*:\s*"([^"]+)"/);
    const sdMatch = html.match(/"browser_native_sd_url"\s*:\s*"([^"]+)"/) || html.match(/"playable_url"\s*:\s*"([^"]+)"/);
    const ogVideo = html.match(/<meta[^>]+property="og:video"[^>]+content="([^"]+)"/i) || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:video"/i);

    console.log("HD URL found:", hdMatch?.[1] ? "YES" : "NO");
    console.log("SD URL found:", sdMatch?.[1] ? "YES" : "NO");
    console.log("OG Video found:", ogVideo?.[1] ? "YES" : "NO");
  } catch (e) {
    console.log("FB error:", e.message);
  }
}

async function run() {
  await testTiktok();
  await testFB();
}

run();
