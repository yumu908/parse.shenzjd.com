const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "WeiboIntlAndroid/6.1.1 (Linux; Android 12)";

async function testIntl(fid) {
  console.log("\nTesting Weibo Intl API for fid:", fid);
  const cleanId = fid.replace(/^1034:/, "");

  const urls = [
    `https://weibointl.api.weibo.cn/portal.php?a=get_co_detail&id=${cleanId}`,
    `https://api.weibo.cn/2/statuses/show?id=${cleanId}`,
    `https://video.weibo.com/show?fid=${fid}&_format=json`,
  ];

  for (const u of urls) {
    console.log("Fetching:", u);
    try {
      const res = await fetch(u, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(4000),
      });
      console.log("Status:", res.status);
      const text = await res.text();
      console.log("Len:", text.length);

      try {
        const json = JSON.parse(text);
        console.log("JSON snippet:\n", JSON.stringify(json, null, 2).slice(0, 600));
      } catch {
        console.log("Text snippet:", text.slice(0, 200));
      }
    } catch (e) {
      console.error("Error:", e.message);
    }
  }
}

async function main() {
  await testIntl("1034:5314173463363635");
}

main();
