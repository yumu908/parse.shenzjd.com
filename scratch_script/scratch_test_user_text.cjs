const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

function extractUrl(text) {
  const httpUrl = text.match(
    /(https?:\/\/[^\s\u3000\u00A0，。！？、；：【】（）《》“”‘’]+)/
  );
  if (httpUrl && httpUrl[1]) {
    return httpUrl[1].replace(/[，。！？、；：.,!?;]+$/, "");
  }
  return null;
}

function detectPlatform(text) {
  const rawUrl = extractUrl(text);
  if (!rawUrl) return "douyin";

  let host = "";
  try {
    const href = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
    host = new URL(href).hostname.toLowerCase();
  } catch {}

  if (!host) return "douyin";

  if (
    host === "weishi.qq.com" ||
    host.endsWith(".weishi.qq.com") ||
    host.includes("weishi")
  ) {
    return "weishi";
  }

  return "douyin";
}

async function testUserText() {
  const text = "【差点被姐姐发现>>https://isee.weishi.qq.com/ws/app-pages/share/index.html?wxplay=1&id=7R6CMpGYB1WQIwB82&spid=1786470174033647&qua=v2_iph_weishi_8.200.1_203_app_a&from_share=1&chid=100004006&pkg=3670&attach=cp_reserves3_1000060003】 差点被姐姐发现 https://video.weishi.qq.com/1O8TkmT0 (来自 @微视)";

  const url = extractUrl(text);
  const platform = detectPlatform(text);

  console.log("Extracted URL:", url);
  console.log("Detected Platform:", platform);

  // 从 extracted URL 提取 ID
  const m = url.match(/[?&]id=([A-Za-z0-9_]+)/i) ||
            url.match(/[?&]feedid=([A-Za-z0-9_]+)/i) ||
            url.match(/id=([A-Za-z0-9_]+)/i);

  console.log("Extracted ID:", m?.[1]);
}

testUserText();
