const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function testWeishi(url) {
  console.log("\n-------------------");
  console.log("Testing Weishi URL:", url);

  // 1. 测试重定向
  let finalUrl = url;
  let feedId = "";
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      redirect: "follow",
    });
    finalUrl = res.url;
    console.log("Status:", res.status, "Final URL:", finalUrl);

    // 匹配 feedid / feed_id / id / path
    const m = finalUrl.match(/feedid=([A-Za-z0-9_]+)/i) ||
              finalUrl.match(/feed_id=([A-Za-z0-9_]+)/i) ||
              finalUrl.match(/id=([A-Za-z0-9_]+)/i) ||
              finalUrl.match(/\/([A-Za-z0-9_]{6,30})/);
    feedId = m?.[1] || "";
    console.log("Extracted Feed ID from redirect/url:", feedId);
  } catch (e) {
    console.error("Fetch redirect error:", e.message);
  }

  if (!feedId) {
    const pathMatch = url.match(/\/([A-Za-z0-9_]{6,30})/);
    feedId = pathMatch?.[1] || "";
    console.log("Fallback path feedId:", feedId);
  }

  if (feedId) {
    const apiUrls = [
      `https://h5.weishi.qq.com/webapp/json/weishi/WSH5GetPlayPage?feedid=${feedId}`,
      `https://h5.weishi.qq.com/webapp/json/weishi/WSH5GetPlayPage?feed_id=${feedId}`,
    ];

    for (const apiUrl of apiUrls) {
      console.log("Testing API:", apiUrl);
      try {
        const apiRes = await fetch(apiUrl, {
          headers: { "User-Agent": UA }
        });
        const json = await apiRes.json();
        console.log("API ret:", json.ret, "msg:", json.msg);
        const feeds = json.data?.feeds || [];
        console.log("Feeds len:", feeds.length);
        if (feeds[0]) {
          console.log("Title:", feeds[0].feed_desc_withat || feeds[0].feed_desc);
          console.log("Video URL:", feeds[0].video_url);
        }
      } catch (e) {
        console.error("API error:", e.message);
      }
    }
  }
}

async function main() {
  await testWeishi("https://video.weishi.qq.com/9UdU0HkD");
  await testWeishi("https://video.weishi.qq.com/D3C21BTy");
}

main();
