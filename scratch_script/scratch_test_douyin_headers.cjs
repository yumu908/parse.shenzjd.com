async function testDouyinHeaders() {
  const url = "https://v.douyin.com/4lyQ65pNh0A/";

  console.log("Testing fetch follow redirect for:", url);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1"
      },
      redirect: "follow"
    });
    console.log("Follow Status:", res.status);
    console.log("Final URL:", res.url);
  } catch (e) {
    console.log("Follow error:", e.message);
  }
}

testDouyinHeaders();
