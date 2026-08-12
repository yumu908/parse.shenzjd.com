const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function getSubCookie() {
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
    const setCookie = res.headers.get("set-cookie");
    console.log("Set-Cookie:", setCookie);
  } catch (e) {
    console.error("Sub error:", e.message);
  }
}

async function testWeiboH5(fid) {
  const cleanId = fid.split("&")[0].split("?")[0];
  console.log("\nTesting H5 URL for cleanId:", cleanId);

  // 尝试从 https://h5.video.weibo.com/show/m/${cleanId} 或 https://m.weibo.cn/detail/${cleanId} 抓取
  const urls = [
    `https://h5.video.weibo.com/show/m/${cleanId}`,
    `https://m.weibo.cn/detail/${cleanId}`,
  ];

  for (const u of urls) {
    console.log("Fetching:", u);
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
      console.log("Text len:", text.length);

      const streamMatch =
        text.match(/https?:[^\s"'<>]+?\.mp4[^\s"'<>]*/i) ||
        text.match(/"stream_url"\s*:\s*"([^"]+)"/i) ||
        text.match(/"url"\s*:\s*"(https?:[^\"]+?\.mp4[^\"]*)"/i);

      if (streamMatch) {
        console.log("SUCCESS! Found stream:", streamMatch[1] || streamMatch[0]);
      }
    } catch (e) {
      console.error("Error:", e.message);
    }
  }
}

async function main() {
  await getSubCookie();
  await testWeiboH5("1034:5314173463363635");
  await testWeiboH5("1034:5325328441081920");
}

main();
