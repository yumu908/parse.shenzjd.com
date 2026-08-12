const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function testWeiboAjax(mid, fid) {
  console.log("\nTesting Weibo AJAX endpoint for mid:", mid, "fid:", fid);

  const urls = [
    `https://weibo.com/ajax/statuses/show?id=${mid}`,
    `https://weibo.com/ajax/statuses/show?id=${fid}`,
  ];

  for (const url of urls) {
    console.log("Fetching:", url);
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": UA,
          "Referer": "https://weibo.com/",
          "Accept": "application/json, text/plain, */*",
        },
        signal: AbortSignal.timeout(5000),
      });

      console.log("Status:", res.status);
      const text = await res.text();
      console.log("Len:", text.length);

      try {
        const json = JSON.parse(text);
        console.log("JSON snippet:\n", JSON.stringify(json, null, 2).slice(0, 800));
        const media = json?.page_info?.media_info || json?.status?.page_info?.media_info;
        const stream = media?.stream_url_hd || media?.stream_url || media?.mp4_hd_url;
        if (stream) {
          console.log("SUCCESS! Found stream:", stream);
        }
      } catch {
        console.log("HTML/Text snippet:", text.slice(0, 200));
      }
    } catch (e) {
      console.error("Fetch error:", e.message);
    }
  }
}

async function main() {
  await testWeiboAjax("5326514410233933", "1034:5326514065965150");
}

main();
