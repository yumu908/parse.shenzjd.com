const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

async function testSixroomCdn() {
  const url = "https://minivideo.xiu123.cn/original/1077a4646af071efbfed4531958c0102/3a1c28d4-191be6bc101.mp4";
  console.log("Testing direct fetch for Sixroom CDN:", url);

  try {
    const resNoRef = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });
    console.log("No Referer status:", resNoRef.status, "Content-Length:", resNoRef.headers.get("content-length"));
  } catch (e) {
    console.error("No Referer Error:", e.message);
  }

  try {
    const resRef = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Referer": "https://v.6.cn/",
      },
    });
    console.log("With Referer status:", resRef.status, "Content-Length:", resRef.headers.get("content-length"));
  } catch (e) {
    console.error("With Referer Error:", e.message);
  }
}

testSixroomCdn();
