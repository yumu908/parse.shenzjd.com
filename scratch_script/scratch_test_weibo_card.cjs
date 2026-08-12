const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function testCard(fid) {
  console.log("\nTesting card.weibo.com and ajax for fid:", fid);

  const urls = [
    `https://card.weibo.com/video/v/show?object_id=${fid}`,
    `https://m.weibo.cn/api/container/getIndex?containerid=1034%3A${fid.replace("1034:", "")}`,
    `https://weibo.com/ajax/statuses/buildComments?flow=0&is_reload=1&id=${fid}`,
  ];

  for (const u of urls) {
    console.log("\nFetching:", u);
    try {
      const res = await fetch(u, {
        headers: {
          "User-Agent": UA,
          "Referer": "https://m.weibo.cn/",
        },
        signal: AbortSignal.timeout(5000),
      });

      console.log("Status:", res.status);
      const text = await res.text();
      console.log("Len:", text.length);

      try {
        const json = JSON.parse(text);
        console.log("JSON snippet:\n", JSON.stringify(json, null, 2).slice(0, 800));
      } catch {
        const mp4Match = text.match(/https?:[^\s"'<>]+?\.mp4[^\s"'<>]*/i) || text.match(/"stream_url"\s*:\s*"([^"]+)"/i);
        console.log("MP4 in HTML:", mp4Match?.[1] || mp4Match?.[0]);
      }
    } catch (e) {
      console.error("Fetch error:", e.message);
    }
  }
}

async function main() {
  await testCard("1034:5314173463363635");
}

main();
