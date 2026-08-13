const dns = require('dns');
try { dns.setDefaultResultOrder('ipv4first'); } catch {}

async function testCleanUAs() {
  const videoId = "7665346525232688101";
  const url = `https://www.iesdouyin.com/share/video/${videoId}`;

  const uas = [
    {
      name: "Clean iPhone UA",
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9",
      }
    },
    {
      name: "Clean Desktop UA",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9",
      }
    }
  ];

  for (const item of uas) {
    console.log(`\n=== Testing ${item.name} ===`);
    try {
      const res = await fetch(url, { headers: item.headers });
      console.log("Status:", res.status);
      const html = await res.text();
      console.log("HTML length:", html.length);
      console.log("Contains _ROUTER_DATA?", html.includes("_ROUTER_DATA"));
      console.log("Contains _$jsvmprt?", html.includes("_$jsvmprt"));
      
      const routerMatch = html.match(/_ROUTER_DATA\s*=\s*(.*?)<\/script>/s);
      if (routerMatch) {
        console.log("Router match snippet:", routerMatch[1].substring(0, 300));
      }
    } catch (e) {
      console.log("Error:", e.message);
    }
  }
}

testCleanUAs();
