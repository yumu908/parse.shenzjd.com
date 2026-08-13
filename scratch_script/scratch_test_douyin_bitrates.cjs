const fs = require('fs');
const dns = require('dns');
try { dns.setDefaultResultOrder('ipv4first'); } catch {}

const MOBILE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "zh-CN,zh;q=0.9",
};

const DESKTOP_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
  "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "none",
  "sec-fetch-user": "?1",
  "upgrade-insecure-requests": "1",
};

async function test() {
  const shortUrl = "https://v.douyin.com/qD7hmCr2mJA/";
  console.log("1. Resolving short link:", shortUrl);
  const res = await fetch(shortUrl, { headers: MOBILE_HEADERS, redirect: "manual" });
  const location = res.headers.get("location") || shortUrl;
  console.log("Location:", location);

  const awemeIdMatch = location.match(/(?:video|note|story|modal_id=)\/?(\d+)/) || location.match(/(\d{18,19})/);
  const awemeId = awemeIdMatch ? awemeIdMatch[1] : null;
  console.log("AwemeId:", awemeId);

  if (!awemeId) return;

  // Try iteminfo API
  console.log("\n2. Trying ItemInfo API...");
  const itemInfoUrl = `https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=${awemeId}`;
  try {
    const r1 = await fetch(itemInfoUrl, { headers: MOBILE_HEADERS });
    const j1 = await r1.json();
    console.log("ItemInfo response has item_list?", !!j1?.item_list?.length);
    if (j1?.item_list?.[0]) {
      inspectVideoStruct(j1.item_list[0]);
      return;
    }
  } catch (e) {
    console.log("ItemInfo API failed:", e.message);
  }

  // Try detail API
  console.log("\n3. Trying Detail API...");
  const detailUrl = `https://www.douyin.com/aweme/v1/web/aweme/detail/?aweme_id=${awemeId}`;
  try {
    const r2 = await fetch(detailUrl, { headers: DESKTOP_HEADERS });
    const j2 = await r2.json();
    console.log("Detail response has aweme_detail?", !!j2?.aweme_detail);
    if (j2?.aweme_detail) {
      inspectVideoStruct(j2.aweme_detail);
      return;
    }
  } catch (e) {
    console.log("Detail API failed:", e.message);
  }

  // Try spider
  console.log("\n4. Trying Spider html...");
  try {
    const r3 = await fetch(`https://www.iesdouyin.com/share/video/${awemeId}`, { headers: MOBILE_HEADERS });
    const html = await r3.text();
    console.log("Spider html length:", html.length);
    const routerMatch = html.match(/_ROUTER_DATA\s*=\s*(.*?)<\/script>/s) || html.match(/_RENDER_DATA\s*=\s*(.*?)<\/script>/s);
    if (routerMatch) {
      let jsonStr = routerMatch[1].trim();
      if (jsonStr.startsWith("%7B") || jsonStr.includes("%22")) jsonStr = decodeURIComponent(jsonStr);
      if (jsonStr.endsWith(";")) jsonStr = jsonStr.slice(0, -1);
      const data = JSON.parse(jsonStr);
      console.log("Found router data!");
      // find item list
      const findItem = (obj) => {
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
      };
      const item = findItem(data);
      if (item) inspectVideoStruct(item);
    }
  } catch (e) {
    console.log("Spider failed:", e.message);
  }
}

function inspectVideoStruct(item) {
  console.log("Item ID:", item.aweme_id);
  console.log("Item Desc:", item.desc);
  const video = item.video;
  if (!video) {
    console.log("No video object found on item!");
    return;
  }

  console.log("\n--- play_addr ---");
  console.log("play_addr url_list:", video.play_addr?.url_list);

  console.log("\n--- play_addr_lowbr ---");
  console.log("play_addr_lowbr url_list:", video.play_addr_lowbr?.url_list);

  console.log("\n--- bit_rate ---");
  if (Array.isArray(video.bit_rate)) {
    video.bit_rate.forEach((br, idx) => {
      console.log(`\nStream #${idx}:`);
      console.log(`  gear_name: ${br.gear_name}`);
      console.log(`  quality_type: ${br.quality_type}`);
      console.log(`  bit_rate: ${br.bit_rate}`);
      console.log(`  is_h265: ${br.is_h265}`);
      console.log(`  play_addr url_list:`, br.play_addr?.url_list);
    });
  } else {
    console.log("No bit_rate array.");
  }
}

test();
