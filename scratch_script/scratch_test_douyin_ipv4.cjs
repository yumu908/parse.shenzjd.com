const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

async function testDouyinIPv4() {
  const url = "https://v.douyin.com/4lyQ65pNh0A/";
  console.log("Testing Douyin with ipv4first:", url);

  try {
    const start = Date.now();
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9",
      },
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
    });
    console.log(`Status: ${res.status}, Time: ${Date.now() - start}ms`);
    console.log(`Location header: ${res.headers.get("location")}`);
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}

testDouyinIPv4();
