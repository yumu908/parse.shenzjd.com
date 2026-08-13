const https = require('https');
const fs = require('fs');

function fetchJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(url);
      const req = https.request({
        hostname: parsed.hostname,
        port: 443,
        path: parsed.pathname + parsed.search,
        method: 'GET',
        family: 4,
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'zh-CN,zh;q=0.9',
          'Host': parsed.hostname,
          ...headers
        },
        timeout: 8000,
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
        });
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
  const awemeId = "7665346525232688101";
  console.log("Testing awemeId:", awemeId);

  // ItemInfo API
  console.log("\n--- Testing ItemInfo API ---");
  const itemInfoUrl = `https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=${awemeId}`;
  try {
    const res1 = await fetchJson(itemInfoUrl);
    const item = res1?.item_list?.[0];
    if (item) {
      console.log("ItemInfo found item!");
      printItemDetails(item);
    } else {
      console.log("ItemInfo returned no item:", JSON.stringify(res1).substring(0, 200));
    }
  } catch (e) {
    console.log("ItemInfo error:", e.message);
  }

  // Detail API
  console.log("\n--- Testing Detail API ---");
  const detailUrl = `https://www.douyin.com/aweme/v1/web/aweme/detail/?aweme_id=${awemeId}`;
  try {
    const res2 = await fetchJson(detailUrl, {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
    });
    const detail = res2?.aweme_detail;
    if (detail) {
      console.log("Detail API found item!");
      printItemDetails(detail);
    } else {
      console.log("Detail API returned no item:", JSON.stringify(res2).substring(0, 200));
    }
  } catch (e) {
    console.log("Detail API error:", e.message);
  }
}

function printItemDetails(item) {
  console.log("Desc:", item.desc);
  console.log("Author:", item.author?.nickname);
  const video = item.video;
  if (!video) return;

  console.log("\nvideo.play_addr.url_list:");
  console.log(video.play_addr?.url_list);

  console.log("\nvideo.play_addr_lowbr.url_list:");
  console.log(video.play_addr_lowbr?.url_list);

  if (Array.isArray(video.bit_rate)) {
    console.log("\nbit_rate count:", video.bit_rate.length);
    video.bit_rate.forEach((br, i) => {
      console.log(`\nbit_rate [${i}]: gear_name=${br.gear_name}, bit_rate=${br.bit_rate}, is_h265=${br.is_h265}`);
      console.log(`  play_addr urls:`, br.play_addr?.url_list);
    });
  }
}

run().catch(console.error);
