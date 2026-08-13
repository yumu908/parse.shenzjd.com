async function testRealDouyinShort() {
  const shortUrls = [
    "https://v.douyin.com/iLR8pQh9/",
    "https://v.douyin.com/k6Xf5sA/",
    "https://v.douyin.com/4lyQ65pNh0A/"
  ];

  for (const url of shortUrls) {
    console.log("\nTesting:", url);
    try {
      const start = Date.now();
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        },
        redirect: "manual",
        signal: AbortSignal.timeout(4000),
      });
      console.log(`Status: ${res.status}, Time: ${Date.now() - start}ms`);
      console.log(`Location: ${res.headers.get("location")}`);
    } catch (e) {
      console.log(`Error for ${url}: ${e.message}`);
    }
  }
}

testRealDouyinShort();
