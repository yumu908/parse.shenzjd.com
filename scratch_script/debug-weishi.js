async function run() {
  const id = "7R6CMpGYB1WQlwB82";
  
  // Test different Weishi API formats:
  // 1. https://h5.weishi.qq.com/webapp/json/weishi/WnsFeedDetail?feedid=7R6CMpGYB1WQlwB82
  // 2. https://h5.weishi.qq.com/weishi/feed/profile/7R6CMpGYB1WQlwB82
  // 3. POST https://h5.weishi.qq.com/webapp/json/weishi/WnsFeedDetail
  // 4. https://isee.weishi.qq.com/ws/app-pages/share/index.html?id=7R6CMpGYB1WQlwB82

  const targets = [
    { url: `https://h5.weishi.qq.com/webapp/json/weishi/WnsFeedDetail?feedid=${id}`, method: "GET" },
    { url: `https://h5.weishi.qq.com/webapp/json/weishi/WnsFeedDetail?id=${id}`, method: "GET" },
    { url: `https://isee.weishi.qq.com/ws/app-pages/share/index.html?id=${id}&wxplay=1`, method: "GET" },
    { url: `https://m.weishi.qq.com/vise/share/index.html?id=${id}`, method: "GET" }
  ];

  for (const t of targets) {
    console.log("Target:", t.url);
    try {
      const res = await fetch(t.url, {
        method: t.method,
        headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.38(0x1800262c) NetType/WIFI Language/zh_CN",
          "Referer": "https://isee.weishi.qq.com/"
        },
        signal: AbortSignal.timeout(5000)
      });
      console.log("Status:", res.status);
      const text = await res.text();
      console.log("Text len:", text.length);
      console.log("Snippet:", text.slice(0, 500));
    } catch (e) {
      console.log("Failed:", e.message);
    }
    console.log("---------------------------------------");
  }
}

run();
