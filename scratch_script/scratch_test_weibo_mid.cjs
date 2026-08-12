const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function testWeiboMid(mid, fid) {
  console.log("\n=========================");
  console.log("Testing Weibo mid:", mid, "fid:", fid);

  // 1. 测试 m.weibo.cn/statuses/show?id=${mid}
  if (mid) {
    console.log("Testing mid API: https://m.weibo.cn/statuses/show?id=" + mid);
    try {
      const res = await fetch(`https://m.weibo.cn/statuses/show?id=${mid}`, {
        headers: {
          "User-Agent": UA,
          "Referer": `https://m.weibo.cn/detail/${mid}`,
          "MWeibo-Pwa": "1",
          "X-Requested-With": "XMLHttpRequest",
        },
        signal: AbortSignal.timeout(5000),
      });

      console.log("Status:", res.status);
      const json = await res.json();
      console.log("Status JSON ok:", json.ok);

      const media = json?.data?.page_info?.media_info || json?.data?.status?.page_info?.media_info;
      const streamUrl = media?.stream_url_hd || media?.stream_url || media?.mp4_hd_url || media?.mp4_sd_url;
      console.log("Found stream_url via mid:", streamUrl);
      console.log("Title:", json?.data?.status_title || json?.data?.page_info?.page_title);
      console.log("Cover:", json?.data?.page_info?.page_pic?.url);
    } catch (e) {
      console.error("mid API error:", e.message);
    }
  }

  // 2. 测试 m.weibo.cn/s/video/object?object_id=${fid}
  if (fid) {
    console.log("\nTesting fid API: https://m.weibo.cn/s/video/object?object_id=" + fid);
    try {
      const res = await fetch(`https://m.weibo.cn/s/video/object?object_id=${fid}`, {
        headers: {
          "User-Agent": UA,
          "Referer": `https://m.weibo.cn/s/video/show?object_id=${fid}`,
        },
        signal: AbortSignal.timeout(5000),
      });

      console.log("Status:", res.status);
      const json = await res.json();
      console.log("Fid JSON ok:", json.ok);
      const obj = json?.data?.object;
      const streamUrl = obj?.stream?.hd_url || obj?.stream?.url;
      console.log("Found stream_url via fid:", streamUrl);
    } catch (e) {
      console.error("fid API error:", e.message);
    }
  }
}

async function main() {
  await testWeiboMid("5326514410233933", "1034:5326514065965150");
}

main();
