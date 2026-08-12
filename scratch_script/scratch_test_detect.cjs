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

  console.log("Raw URL:", rawUrl);
  console.log("Parsed host:", host);

  if (!host) return "douyin";

  if (
    host === "qishui.douyin.com" ||
    host.endsWith(".qishui.douyin.com") ||
    host === "music.douyin.com" ||
    host.endsWith(".music.douyin.com")
  ) {
    return "qsmusic";
  }

  if (
    (host === "douyin.com" ||
      host.endsWith(".douyin.com") ||
      host === "iesdouyin.com" ||
      host.endsWith(".iesdouyin.com") ||
      host === "snssdk.com") &&
    !host.includes("qishui") &&
    !host.includes("music")
  ) {
    return "douyin";
  }

  return "douyin";
}

const text = "《Always Online》@汽水音乐 https://qishui.douyin.com/s/iXJXkjCg/";
console.log("Detected result:", detectPlatform(text));
