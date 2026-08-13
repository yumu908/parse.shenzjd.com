const dns = require('dns');
try { dns.setDefaultResultOrder('ipv4first'); } catch {}

async function testAndroidUA() {
  const awemeId = "7665346525232688101";
  console.log("Testing Android UA for awemeId:", awemeId);

  const headers = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty",
    "referer": "https://www.douyin.com/?recommend=1",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
    "accept": "application/json, text/plain, */*",
  };

  // API 1: iteminfo
  try {
    const url1 = `https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=${awemeId}`;
    console.log("Fetching url1:", url1);
    const res1 = await fetch(url1, { headers });
    console.log("Status1:", res1.status);
    const text1 = await res1.text();
    console.log("Text1 length:", text1.length);
    console.log("Text1 snippet:", text1.substring(0, 300));
  } catch (e) {
    console.log("Error1:", e.message);
  }

  // API 2: detail with cookie or desktop headers
  try {
    const url2 = `https://www.douyin.com/aweme/v1/web/aweme/detail/?aweme_id=${awemeId}`;
    console.log("\nFetching url2:", url2);
    const res2 = await fetch(url2, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.douyin.com/",
        "Cookie": "msToken=abc; ttwid=1%7CYj...;"
      }
    });
    console.log("Status2:", res2.status);
    const text2 = await res2.text();
    console.log("Text2 length:", text2.length);
    console.log("Text2 snippet:", text2.substring(0, 300));
  } catch (e) {
    console.log("Error2:", e.message);
  }
}

testAndroidUA();
