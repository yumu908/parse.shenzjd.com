async function run() {
  const id = "7R6CMpGYB1WQlwB82";

  const testEndpoints = [
    `https://h5.weishi.qq.com/webapp/json/weishi/WnsFeedDetail?g_tk=&feedid=${id}`,
    `https://user.weishi.qq.com/wup?format=json&feedid=${id}`,
    `https://h5.weishi.qq.com/weishi/feed/profile/${id}`,
    `https://m.weishi.qq.com/vise/share/index.html?id=${id}`
  ];

  for (const u of testEndpoints) {
    console.log("Trying endpoint:", u);
    try {
      const res = await fetch(u, {
        headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
          "Referer": "https://h5.weishi.qq.com/"
        },
        signal: AbortSignal.timeout(4000)
      });
      console.log("Status:", res.status, "URL:", res.url);
      const text = await res.text();
      console.log("Body length:", text.length, "Snippet:", text.slice(0, 300));
    } catch (e) {
      console.log("Failed:", e.message);
    }
    console.log("-----------------------------------------");
  }
}

run();
