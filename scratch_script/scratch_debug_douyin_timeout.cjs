const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

async function testDouyin() {
  const url = "https://v.douyin.com/4lyQ65pNh0A/";
  console.log("Testing Douyin short link:", url);

  const headersList = [
    {
      name: "Mobile UA",
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9",
      }
    },
    {
      name: "Desktop UA",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9",
      }
    }
  ];

  for (const h of headersList) {
    console.log(`\n--- Testing ${h.name} with redirect: manual ---`);
    try {
      const start = Date.now();
      const res = await fetch(url, {
        headers: h.headers,
        redirect: "manual",
        signal: AbortSignal.timeout(8000),
      });
      console.log(`[${h.name}] Manual Status: ${res.status}, Time: ${Date.now() - start}ms`);
      console.log(`[${h.name}] Location: ${res.headers.get("location")}`);
    } catch (e) {
      console.log(`[${h.name}] Manual Error: ${e.message}`);
    }
  }
}

testDouyin();
