const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function getWeiboVisitorCookie() {
  try {
    const res = await fetch("https://passport.weibo.com/visitor/genvisitor", {
      method: "POST",
      headers: {
        "User-Agent": UA,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "cb=gen_callback&fp=%7B%22os%22%3A%222%22%2C%22browser%22%3A%22Chrome122.0.0.0%22%2C%22platform%22%3A%22Win32%22%2C%22public_key%22%3A%22MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDDBc3e%22%7D",
      signal: AbortSignal.timeout(5000),
    });
    const text = await res.text();
    console.log("Genvisitor res:", text);
  } catch (e) {
    console.error("Genvisitor error:", e.message);
  }
}

async function testWeiboDirectHtml(fid) {
  console.log("\nTesting direct HTML fetch for fid:", fid);
  const urls = [
    `https://video.weibo.com/show?fid=${fid}`,
    `https://weibo.com/tv/show/${fid}`,
  ];

  for (const url of urls) {
    console.log("\nFetching URL:", url);
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": UA,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        signal: AbortSignal.timeout(6000),
      });

      console.log("Status:", res.status);
      const html = await res.text();
      console.log("HTML len:", html.length);

      const mp4Match = html.match(/https?:[^\s"'<>]+?\.mp4[^\s"'<>]*/i) || html.match(/"stream_url"\s*:\s*"([^"]+)"/i);
      console.log("Found mp4:", mp4Match?.[1] || mp4Match?.[0]);

      const titleMatch = html.match(/<title>(.*?)<\/title>/i) || html.match(/"title"\s*:\s*"([^"]+)"/i);
      console.log("Found title:", titleMatch?.[1]);
    } catch (e) {
      console.error("HTML fetch error:", e.message);
    }
  }
}

async function main() {
  await getWeiboVisitorCookie();
  await testWeiboDirectHtml("1034:5314173463363635");
}

main();
