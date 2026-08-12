const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function testXpc(url) {
  console.log("\n=========================");
  console.log("Testing Xinpianchang URL:", url);

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Referer": "https://www.xinpianchang.com/",
      }
    });

    console.log("Status:", res.status);
    const html = await res.text();
    console.log("HTML length:", html.length);

    // 打印所有的 <script> 标签 id 或内容特征
    const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
    console.log("Total script tags found:", scripts.length);

    for (let i = 0; i < scripts.length; i++) {
      const s = scripts[i];
      if (s.includes("video") || s.includes("cover") || s.includes("progressive") || s.includes("title") || s.includes("__INITIAL_STATE__") || s.includes("__NEXT_DATA__") || s.includes("window.")) {
        console.log(`Script ${i} snippet (${s.length} chars):`, s.slice(0, 300));
      }
    }

    // 正则直接匹配 mp4 / videoUrl / cover / title
    const mp4Match = html.match(/https?:[^\s"'<>]+?\.mp4[^\s"'<>]*/g);
    console.log("Direct MP4 links in HTML:", mp4Match);

    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    console.log("Title match:", titleMatch?.[1]);

  } catch (e) {
    console.error("Fetch Error:", e.message);
  }
}

async function main() {
  await testXpc("https://www.xinpianchang.com/a13777600?from=webShare&channel=copyLink");
  await testXpc("https://www.xinpianchang.com/a13776982?from=webShare&channel=copyLink");
}

main();
