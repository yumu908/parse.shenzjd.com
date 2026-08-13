import { createApiHandler } from "@/lib/api-middleware";

export const runtime = "nodejs";

const DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function parseVideoId(videoId, originalUrl) {
  const tryUrls = [
    originalUrl,
    `https://kg.qq.com/node/play?s=${videoId}`,
    `https://kg.qq.com/node/personal?s=${videoId}`,
    `https://node.kg.qq.com/play?s=${videoId}`,
  ].filter(Boolean);

  let html = "";
  for (const reqUrl of tryUrls) {
    try {
      const res = await fetch(reqUrl, {
        headers: {
          "User-Agent": DESKTOP_UA,
          Referer: "https://kg.qq.com/",
        },
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const text = await res.text();
        if (text.includes("__DATA__") || text.includes("__INITIAL_STATE__")) {
          html = text;
          break;
        }
      }
    } catch {}
  }

  if (!html) {
    return { code: 400, msg: "全民K歌页面抓取失败，请确保链接有效" };
  }

  // 1. 优先从 window.__DATA__ 匹配
  let data = null;
  const m1 = html.match(/window\.__DATA__\s*=\s*(.*?);/s);
  if (m1?.[1]) {
    try {
      const root = JSON.parse(m1[1].trim());
      data = root?.detail;
    } catch {}
  }

  // 2. 备用：从 window.__INITIAL_STATE__ 匹配
  if (!data) {
    const mInitial =
      html.match(/window\.__INITIAL_STATE__\s*=\s*(.*?);<\/script>/s) ||
      html.match(/__INITIAL_STATE__\s*=\s*(.*?);/s);
    if (mInitial?.[1]) {
      try {
        const root = JSON.parse(mInitial[1].trim());
        data = root?.detail || root?.play;
      } catch {}
    }
  }

  // 3. 提取音视频播放地址（兼容 纯音频 K 歌录音 与 MV 视频）
  const playUrl =
    data?.playurl_video ||
    data?.playurl ||
    data?.playurl_audio ||
    data?.song_url ||
    "";

  // 4. 正则备用匹配直链 (支持 .mp4 / .m4a / .mp3)
  let finalUrl = playUrl;
  if (!finalUrl) {
    const directMatch = html.match(/https?:\/\/[^"'\s\\]+\.(mp4|m4a|mp3)[^"'\s\\]*/i);
    if (directMatch?.[0]) {
      finalUrl = directMatch[0].replace(/\\/g, "").replace(/&amp;/g, "&");
    }
  }

  if (!finalUrl) {
    return { code: 404, msg: "未找到全民K歌作品音频/视频播放地址" };
  }

  // 判断内容类型
  const isVideo = !!(data?.playurl_video || finalUrl.includes(".mp4"));

  return {
    code: 200,
    msg: "解析成功",
    data: {
      title: data?.content || data?.song_name || "全民K歌作品",
      author: data?.nick || data?.singer_name || "",
      avatar: data?.avatar || "",
      uid: String(data?.uid || ""),
      cover: data?.cover || data?.cover_url || "",
      type: isVideo ? "video" : "audio",
      url: finalUrl,
    },
  };
}

async function quanminkgeParse(shareUrl) {
  let s = "";
  try {
    const u = new URL(shareUrl);
    s = u.searchParams.get("s") || "";
  } catch {}

  if (!s) {
    const m = shareUrl.match(/[?&]s=([a-zA-Z0-9_-]+)/) || shareUrl.match(/\/([a-zA-Z0-9_-]{10,})/);
    if (m?.[1]) s = m[1];
  }

  if (!s) {
    return { code: 400, msg: "无法从链接中解析全民K歌作品 ID (s)" };
  }

  return parseVideoId(s, shareUrl);
}

export const GET = createApiHandler(quanminkgeParse);
