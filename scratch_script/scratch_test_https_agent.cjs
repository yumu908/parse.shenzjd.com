const https = require('https');

function getRedirectLocation(url) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const req = https.request({
        hostname: parsed.hostname,
        port: 443,
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9',
          'Host': parsed.hostname,
        },
        timeout: 4000,
      }, (res) => {
        console.log(`[https.request] Status: ${res.statusCode}`);
        const location = res.headers.location;
        console.log(`[https.request] Location: ${location}`);
        resolve(location || null);
      });

      req.on('error', (e) => {
        console.log(`[https.request] Error: ${e.message}`);
        resolve(null);
      });

      req.on('timeout', () => {
        req.destroy();
        console.log(`[https.request] Timeout`);
        resolve(null);
      });

      req.end();
    } catch (e) {
      console.log(`[https.request] Exception: ${e.message}`);
      resolve(null);
    }
  });
}

async function testDouyinHttps() {
  const url = "https://v.douyin.com/k6Xf5sA/";
  console.log("Testing https.request on:", url);
  const loc = await getRedirectLocation(url);
  console.log("Result location:", loc);
}

testDouyinHttps();
