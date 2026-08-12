import { createApiHandler } from "@/lib/api-middleware";
import { logger } from "@/lib/api-utils";

export const runtime = "nodejs";

const DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const MOBILE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

/**
 * 解构 Facebook 转义字符并清理 Range 切片限制
 */
function cleanFbUrl(rawUrl) {
  if (!rawUrl) return "";
  let clean = rawUrl
    .replace(/\\u00253D/gi, "=")
    .replace(/\\u002526/gi, "&")
    .replace(/\\u0026/gi, "&")
    .replace(/\\u002F/gi, "/")
    .replace(/\\/g, "")
    .replace(/&amp;/g, "&");

  // 移除 &bytestart=0&byteend=866 等切片限制，获取全量完整 MP4
  clean = clean.replace(/&bytestart=\d+&byteend=\d+/gi, "");

  if (clean.startsWith("//")) {
    clean = "https:" + clean;
  }
  return clean;
}

/**
 * 提取 FB 真实链接
 */
async function getFinalFbUrl(url) {
  let cleanUrl = url.trim();
  if (cleanUrl.startsWith("http://")) {
    cleanUrl = "https://" + cleanUrl.slice(7);
  }

  if (cleanUrl.includes("fb.watch") || cleanUrl.includes("/share/")) {
    try {
      const res = await fetch(cleanUrl, {
        headers: { "User-Agent": MOBILE_UA },
        redirect: "manual",
        signal: AbortSignal.timeout(6000),
      });
      const location = res.headers.get("location");
      if (location) return location;
    } catch {}

    try {
      const res = await fetch(cleanUrl, {
        headers: { "User-Agent": MOBILE_UA },
        redirect: "follow",
        signal: AbortSignal.timeout(6000),
      });
      if (res.url) return res.url;
    } catch {}
  }

  return cleanUrl;
}

async function facebookParse(shareUrl) {
  try {
    const finalUrl = await getFinalFbUrl(shareUrl);
    logger.log(`[Facebook] 解析 finalUrl: ${finalUrl}`);

    const tryHeaders = [
      { "User-Agent": DESKTOP_UA, "Accept-Language": "en-US,en;q=0.9" },
      { "User-Agent": MOBILE_UA, "Accept-Language": "en-US,en;q=0.9" },
    ];

    let html = "";
    for (const headers of tryHeaders) {
      try {
        const res = await fetch(finalUrl, {
          headers,
          signal: AbortSignal.timeout(6000),
        });
        if (res.ok) {
          const text = await res.text();
          if (
            text.includes("fbcdn.net") ||
            text.includes("playable_url") ||
            text.includes("browser_native") ||
            text.includes("og:video")
          ) {
            html = text;
            break;
          }
          if (!html) html = text;
        }
      } catch {}
    }

    if (!html) {
      return { code: 400, msg: "无法抓取 Facebook 视频页面，请确保链接格式正确且视频公开" };
    }

    // 强制按用户指定规范：必须包含 xx.fbcdn.net/o1/v/t2/f2 且包含 .mp4
    let rawVideoUrl = "";
    const allCandidates = html.matchAll(/https?:\/\/[^"'\s\\]+\.fbcdn\.net\/[^\s"'\\]+/gi);
    for (const m of allCandidates) {
      const candidate = m[0];
      if (
        (candidate.includes("xx.fbcdn.net/o1/v/t2/f2") || candidate.includes("fbcdn.net/o1/v/")) &&
        candidate.includes(".mp4") &&
        !candidate.includes("scontent")
      ) {
        rawVideoUrl = candidate;
        break;
      }
    }

    // 兜底降级匹配：提取包含 browser_native_hd_url / playable_url / hd_src 等字段
    if (!rawVideoUrl) {
      const fbCdnMatch =
        html.match(/"browser_native_hd_url"\s*:\s*"([^"]+)"/i) ||
        html.match(/"playable_url_quality_hd"\s*:\s*"([^"]+)"/i) ||
        html.match(/"browser_native_sd_url"\s*:\s*"([^"]+)"/i) ||
        html.match(/"playable_url"\s*:\s*"([^"]+)"/i) ||
        html.match(/hd_src\s*:\s*"([^"]+)"/i) ||
        html.match(/sd_src\s*:\s*"([^"]+)"/i) ||
        html.match(/<meta[^>]+property="og:video"[^>]+content="([^"]+)"/i);

      rawVideoUrl = fbCdnMatch?.[1] || fbCdnMatch?.[0] || "";
    }

    const videoUrl = cleanFbUrl(rawVideoUrl);

    if (!videoUrl) {
      return { code: 404, msg: "未找到 Facebook 视频播放地址，可能是私密视频或仅限好友可见" };
    }

    // 2. 匹配标题与封面
    const titleMatch =
      html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i) ||
      html.match(/<title>(.*?)<\/title>/i);

    const coverMatch =
      html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i) ||
      html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);

    const title = titleMatch?.[1]?.replace(/\| Facebook.*/i, "").trim() || "Facebook Video";
    const cover = cleanFbUrl(coverMatch?.[1] || "");

    return {
      code: 200,
      msg: "解析成功",
      data: {
        title,
        author: "Facebook User",
        avatar: "",
        cover,
        url: videoUrl,
      },
    };
  } catch (error) {
    logger.error("Error in facebookParse:", error);
    return { code: 500, msg: "Facebook 服务器解析失败" };
  }
}

export const GET = createApiHandler(facebookParse, { shouldCache: false });
