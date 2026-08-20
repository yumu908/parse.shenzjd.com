import { createApiHandler } from "@/lib/api-middleware";
import { DEFAULT_MOBILE_UA } from "@/lib/default-mobile-ua";

/**
 * 彻底解码与清洗 URL 中的 \u002F Unicode 转义符与转义斜杠，防止视频地址变成 u002F... 导致前端播放 404
 */
function decodeCleanUrl(str) {
  if (!str) return "";
  let clean = String(str)
    .replace(/\\u002F/gi, "/")
    .replace(/\\u002f/gi, "/")
    .replace(/u002F/gi, "/")
    .replace(/u002f/gi, "/")
    .replace(/\\/g, "");

  if (clean.startsWith("//")) {
    clean = "https:" + clean;
  } else if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    clean = "https://" + clean.replace(/^\/+/, "");
  }
  return clean;
}

/**
 * 直接通过抓取微视 HTML 详情页解构高清视频流（最干净、最稳定的直接抓取路径）
 */
async function parseVideoId(videoId) {
  const htmlUrls = [
    `https://isee.weishi.qq.com/ws/app-pages/share/index.html?id=${videoId}`,
    `https://m.weishi.qq.com/vise/share/index.html?id=${videoId}`,
    `https://isee.weishi.qq.com/share/index.html?id=${videoId}`,
  ];

  for (const htmlUrl of htmlUrls) {
    try {
      const res = await fetch(htmlUrl, {
        headers: {
          "User-Agent": DEFAULT_MOBILE_UA,
          "Referer": "https://isee.weishi.qq.com/",
        },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const html = await res.text();
        const videoMatch =
          html.match(/"video_url"\s*:\s*"([^"]+)"/i) ||
          html.match(/<video[^>]+src="([^"]+)"/i) ||
          html.match(/"url"\s*:\s*"(https?:[^\"]+?\.mp4[^\"]*)"/i) ||
          html.match(/https?:\/\/[^\s"'<>]+?\.mp4[^\s"'<>]*/i) ||
          html.match(/(?:\\u002F){2}[^\s"'<>]+\.mp4[^\s"'<>]*/i);

        if (videoMatch) {
          const rawVideoUrl = videoMatch[1] || videoMatch[0];
          const cleanVideoUrl = decodeCleanUrl(rawVideoUrl);
          const titleMatch = html.match(/<title>(.*?)<\/title>/i) || html.match(/"feed_desc"\s*:\s*"([^"]+)"/i);
          const coverMatch = html.match(/"cover_url"\s*:\s*"([^"]+)"/i) || html.match(/poster="([^"]+)"/i);
          const authorMatch = html.match(/"nick"\s*:\s*"([^"]+)"/i) || html.match(/"nickname"\s*:\s*"([^"]+)"/i);
          const avatarMatch = html.match(/"avatar"\s*:\s*"([^"]+)"/i);

          return {
            code: 200,
            msg: "解析成功",
            platform: "weishi",
            data: {
              title: titleMatch?.[1]?.replace(/_微视.*/, "").trim() || "微视视频",
              author: authorMatch?.[1] || "",
              avatar: decodeCleanUrl(avatarMatch?.[1] || ""),
              cover: decodeCleanUrl(coverMatch?.[1] || ""),
              url: cleanVideoUrl,
            },
          };
        }
      }
    } catch {}
  }

  return { code: 404, msg: "未找到微视视频播放地址，请稍后再试", platform: "weishi" };
}

async function weishiParse(shareUrl) {
  let feedId = "";

  // 1. 优先正则捕获 Query 参数 id=7mU7VjzWi1WS4t7kg 或 feedid=7mU7VjzWi1WS4t7kg
  const mQuery =
    shareUrl.match(/[?&]id=([A-Za-z0-9_]+)/i) ||
    shareUrl.match(/[?&]feedid=([A-Za-z0-9_]+)/i) ||
    shareUrl.match(/[?&]feed_id=([A-Za-z0-9_]+)/i);

  if (mQuery?.[1]) {
    feedId = mQuery[1];
  }

  // 2. 若未含 Query 参数，尝试跟进 302 手动重定向获取 Location 响应头
  if (!feedId) {
    try {
      const res = await fetch(shareUrl, {
        headers: { "User-Agent": DEFAULT_MOBILE_UA },
        redirect: "manual",
        signal: AbortSignal.timeout(6000),
      });
      const location = res.headers.get("location");
      if (location) {
        const mLoc =
          location.match(/[?&]id=([A-Za-z0-9_]+)/i) ||
          location.match(/[?&]feedid=([A-Za-z0-9_]+)/i) ||
          location.match(/\/([A-Za-z0-9_]{10,})/);
        if (mLoc?.[1]) {
          feedId = mLoc[1];
        }
      }
    } catch {}
  }

  // 3. Follow redirect 备用路径
  if (!feedId) {
    try {
      const res = await fetch(shareUrl, {
        headers: { "User-Agent": DEFAULT_MOBILE_UA },
        redirect: "follow",
        signal: AbortSignal.timeout(6000),
      });
      if (res.url && res.url !== shareUrl) {
        const mRedirect =
          res.url.match(/[?&]id=([A-Za-z0-9_]+)/i) ||
          res.url.match(/[?&]feedid=([A-Za-z0-9_]+)/i) ||
          res.url.match(/\/([A-Za-z0-9_]{10,})/);
        if (mRedirect?.[1]) {
          feedId = mRedirect[1];
        }
      }
    } catch {}
  }

  // 4. 最后 fallback 短链路径剥离
  if (!feedId) {
    const mPath = shareUrl.match(/\/([A-Za-z0-9_]{5,})/);
    if (mPath?.[1]) {
      feedId = mPath[1];
    }
  }

  if (!feedId) {
    return { code: 400, msg: "无法从微视链接解析视频 id", platform: "weishi" };
  }

  return parseVideoId(feedId);
}

export const GET = createApiHandler(weishiParse);
