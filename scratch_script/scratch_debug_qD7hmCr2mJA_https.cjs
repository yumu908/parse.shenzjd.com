const https = require('https');

function fetchUrl(url, headers = {}) {
  return new Promise((resolve, reject) => {
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
          ...headers
        },
        timeout: 8000,
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
      });

      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
      req.end();
    } catch (e) {
      reject(e);
    }
  });
}

async function run() {
  const shortUrl = "https://v.douyin.com/qD7hmCr2mJA/";
  console.log("Resolving shortUrl:", shortUrl);
  const res1 = await fetchUrl(shortUrl);
  console.log("Status:", res1.status);
  const location = res1.headers.location || shortUrl;
  console.log("Location:", location);

  const match = location.match(/(?:video|note|story|modal_id=)\/?(\d+)/) || location.match(/(\d{18,19})/);
  const awemeId = match ? match[1] : null;
  console.log("Extracted awemeId:", awemeId);

  if (!awemeId) return;

  // Fetch iesdouyin share video
  const shareUrl = `https://www.iesdouyin.com/share/video/${awemeId}`;
  console.log("Fetching share URL:", shareUrl);
  const res2 = await fetchUrl(shareUrl);
  console.log("Share page status:", res2.status, "body length:", res2.body.length);

  const routerMatch = res2.body.match(/_ROUTER_DATA\s*=\s*(.*?)<\/script>/s) || res2.body.match(/_RENDER_DATA\s*=\s*(.*?)<\/script>/s);
  console.log("Found routerMatch?", !!routerMatch);

  if (routerMatch) {
    let jsonStr = routerMatch[1].trim();
    if (jsonStr.startsWith("%7B") || jsonStr.includes("%22")) jsonStr = decodeURIComponent(jsonStr);
    if (jsonStr.endsWith(";")) jsonStr = jsonStr.slice(0, -1);
    const data = JSON.parse(jsonStr);
    
    // Find item
    function findItem(obj) {
      if (!obj || typeof obj !== 'object') return null;
      if (obj.aweme_id === awemeId || obj.awemeId === awemeId) return obj;
      if (Array.isArray(obj)) {
        for (let x of obj) {
          const r = findItem(x);
          if (r) return r;
        }
      } else {
        for (let k in obj) {
          const r = findItem(obj[k]);
          if (r) return r;
        }
      }
      return null;
    }

    const item = findItem(data);
    if (item && item.video) {
      console.log("\nFound item video struct:");
      console.log("play_addr:", JSON.stringify(item.video.play_addr, null, 2));
      console.log("play_addr_lowbr:", JSON.stringify(item.video.play_addr_lowbr, null, 2));
      console.log("bit_rate count:", item.video.bit_rate?.length);
      if (item.video.bit_rate) {
        item.video.bit_rate.forEach((br, i) => {
          console.log(`\nbit_rate [${i}]: gear_name=${br.gear_name}, bit_rate=${br.bit_rate}, is_h265=${br.is_h265}`);
          console.log(`urls:`, br.play_addr?.url_list);
        });
      }
    }
  }

  // Also check regex match for play_addr in html
  const playAddrMatch = res2.body.match(/"play_addr":\s*\{\s*"url_list":\s*\[\s*"([^"]+)"/);
  console.log("\nplay_addr regex match in HTML:", playAddrMatch ? playAddrMatch[1] : "None");
}

run().catch(console.error);
