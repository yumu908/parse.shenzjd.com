const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UAs = [
  // 微信 UA
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.38(0x1800262c) NetType/WIFI Language/zh_CN",
  // 百度蜘蛛 UA
  "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)",
  // Googlebot UA
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  // 安卓 App UA
  "Mozilla/5.0 (Linux; Android 12; SM-G998B Build/SP1A.210812.016) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.71 Mobile Safari/537.36",
];

async function testUa(url, ua, name) {
  console.log(`Testing ${name} on ${url}...`);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": ua,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Referer": "https://www.xinpianchang.com/",
      },
      signal: AbortSignal.timeout(5000),
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Len:", text.length);

    if (text.includes("__NEXT_DATA__")) {
      console.log("SUCCESS! __NEXT_DATA__ FOUND with UA:", name);
    } else if (text.includes("video")) {
      console.log("SUCCESS! Video keyword found with UA:", name);
    } else {
      console.log("WAF shield or no next_data. Snippet:", text.slice(0, 200));
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}

async function main() {
  const url = "https://www.xinpianchang.com/a13777600";
  let count = 1;
  for (const ua of UAs) {
    await testUa(url, ua, `UA-${count++}`);
  }
}

main();
