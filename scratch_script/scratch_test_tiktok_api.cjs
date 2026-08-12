async function testTikTokApis() {
  const shareUrl = "https://www.tiktok.com/@vicky_china_travel_guide/video/7659724653635587341?is_from_webapp=1&sender_device=pc";
  const videoId = "7659724653635587341";

  // API 1: tikwm
  try {
    console.log("Testing TikWM API...");
    const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(shareUrl)}`);
    if (res.ok) {
      const json = await res.json();
      console.log("TikWM Code:", json.code);
      console.log("TikWM Data Play:", json.data?.play);
      console.log("TikWM Title:", json.data?.title);
      console.log("TikWM Author:", json.data?.author?.nickname);
    }
  } catch (e) {
    console.log("TikWM error:", e.message);
  }

  // API 2: aweme feed
  try {
    console.log("\nTesting Aweme Feed API...");
    const res = await fetch(`https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${videoId}`, {
      headers: {
        "User-Agent": "TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet"
      }
    });
    console.log("Aweme status:", res.status);
    if (res.ok) {
      const json = await res.json();
      console.log("Aweme item count:", json.aweme_list?.length);
      console.log("Aweme play_addr:", json.aweme_list?.[0]?.video?.play_addr?.url_list);
    }
  } catch (e) {
    console.log("Aweme error:", e.message);
  }
}

testTikTokApis();
