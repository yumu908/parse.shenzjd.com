const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function testNumeric(fid) {
  const numericId = fid.replace(/^1034:/, "");
  console.log(`Testing fid ${fid} -> numericId: ${numericId}`);

  const urls = [
    `https://m.weibo.cn/statuses/show?id=${numericId}`,
    `https://m.weibo.cn/detail/${numericId}`,
    `https://weibo.com/ajax/statuses/show?id=${numericId}`,
  ];

  for (const u of urls) {
    console.log("Fetching:", u);
    try {
      const res = await fetch(u, {
        headers: {
          "User-Agent": UA,
          "Referer": "https://m.weibo.cn/",
        },
        signal: AbortSignal.timeout(4000),
      });

      console.log("Status:", res.status);
      const text = await res.text();
      console.log("Len:", text.length);

      try {
        const json = JSON.parse(text);
        console.log("JSON keys:", Object.keys(json));
        const media = json?.data?.page_info?.media_info || json?.page_info?.media_info;
        if (media?.stream_url || media?.mp4_hd_url || media?.mp4_sd_url) {
          console.log("SUCCESS! Media found:", media.stream_url || media.mp4_hd_url || media.mp4_sd_url);
        }
      } catch {
        const mp4 = text.match(/https?:[^\s"'<>]+?\.mp4[^\s"'<>]*/i);
        if (mp4) console.log("MP4 found in HTML:", mp4[0]);
      }
    } catch (e) {
      console.error("Error:", e.message);
    }
  }
}

async function main() {
  await testNumeric("1034:5314173463363635");
  await testNumeric("1034:5325328441081920");
}

main();
