const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function testManualRedirect(url) {
  console.log("\nTesting URL with redirect manual:", url);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": UA },
      redirect: "manual",
    });
    console.log("Status:", res.status);
    const location = res.headers.get("location");
    console.log("Location header:", location);

    let targetUrl = location || url;

    // 如果 location 是相对路径
    if (location && location.startsWith("/")) {
      targetUrl = new URL(location, url).toString();
    }

    console.log("Target URL:", targetUrl);

    // 从 Target URL 提取 17 位 feedid
    const m = targetUrl.match(/feedid=([A-Za-z0-9_]+)/i) ||
              targetUrl.match(/feed_id=([A-Za-z0-9_]+)/i) ||
              targetUrl.match(/id=([A-Za-z0-9_]+)/i) ||
              targetUrl.match(/\/([A-Za-z0-9_]{10,})/);

    const feedId = m?.[1] || "";
    console.log("Extracted Feed ID:", feedId);

    if (feedId) {
      const apiUrl = `https://h5.weishi.qq.com/webapp/json/weishi/WSH5GetPlayPage?feedid=${feedId}`;
      console.log("API URL:", apiUrl);
      const apiRes = await fetch(apiUrl, {
        headers: { "User-Agent": UA }
      });
      console.log("API Status:", apiRes.status);
      const json = await apiRes.json();
      console.log("API ret:", json.ret, "msg:", json.msg);
      if (json.data?.feeds?.[0]) {
        console.log("SUCCESS! Video URL:", json.data.feeds[0].video_url);
      }
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}

async function main() {
  await testManualRedirect("https://video.weishi.qq.com/9UdU0HkD");
  await testManualRedirect("https://video.weishi.qq.com/D3C21BTy");
}

main();
