const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

async function testAcfunDesktop() {
  console.log("Testing AcFun Desktop...");
  try {
    const res = await fetch("https://www.acfun.cn/v/ac48634587", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Referer": "https://www.acfun.cn/",
      },
      signal: AbortSignal.timeout(5000),
    });

    console.log("Status:", res.status);
    const html = await res.text();
    console.log("HTML len:", html.length);

    const playInfoRe = /window\.pageInfo\s*=\s*window\.videoInfo\s*=\s*(.*?);/s || /var videoInfo\s*=\s*(.*?);/s;
    const match = html.match(/var videoInfo\s*=\s*(.*?);/s) || html.match(/currentVideoInfo\s*=\s*(.*?);/s);

    if (match?.[1]) {
      console.log("Found info snippet:\n", match[1].slice(0, 800));
    } else {
      const m3u8 = html.match(/https?:[^\s"'<>]+?\.m3u8[^\s"'<>]*/i) || html.match(/https?:[^\s"'<>]+?\.mp4[^\s"'<>]*/i);
      console.log("Media match in HTML:", m3u8?.[0]);
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}

testAcfunDesktop();
