import { createApiHandler } from "@/lib/api-middleware";
import { logger } from "@/lib/api-utils";

export const runtime = "nodejs";

const MOBILE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

const DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const TIKTOK_APP_UA =
  "TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet";

/**
 * 从短链/长链中提取 TikTok 视频 ID 和重定向链接
 */
async function extractTikTokInfo(url) {
  let targetUrl = url.trim();
  if (targetUrl.startsWith("http://")) {
    targetUrl = "https://" + targetUrl.slice(7);
  }

  let finalUrl = targetUrl;
  let videoId = "";

  // 1. 检查是否直接包含 video/ID 或 v/ID
  const directId =
    targetUrl.match(/\/video\/(\d+)/i)?.[1] ||
    targetUrl.match(/\/v\/(\d+)/i)?.[1] ||
    targetUrl.match(/(\d{15,})/)?.[1];

  if (directId) {
    videoId = directId;
  }

  // 2. 如果是短链 (vt.tiktok.com / vm.tiktok.com / v.tiktok.com)，通过 302 重定向获取真身
  if (!videoId || targetUrl.includes("vt.tiktok.com") || targetUrl.includes("vm.tiktok.com") || targetUrl.includes("v.tiktok.com")) {
    try {
      const res = await fetch(targetUrl, {
        headers: { "User-Agent": MOBILE_UA },
        redirect: "manual",
        signal: AbortSignal.timeout(6000),
      });
      const location = res.headers.get("location");
      if (location) {
        finalUrl = location;
        const idMatch =
          location.match(/\/video\/(\d+)/i)?.[1] ||
          location.match(/\/v\/(\d+)/i)?.[1] ||
          location.match(/(\d{15,})/)?.[1];
        if (idMatch) videoId = idMatch;
      }
    } catch {}
  }

  // 3. 兜底策略：跟进重定向
  if (!videoId) {
    try {
      const res = await fetch(targetUrl, {
        headers: { "User-Agent": MOBILE_UA },
        redirect: "follow",
        signal: AbortSignal.timeout(6000),
      });
      finalUrl = res.url || targetUrl;
      const idMatch =
        finalUrl.match(/\/video\/(\d+)/i)?.[1] ||
        finalUrl.match(/\/v\/(\d+)/i)?.[1] ||
        finalUrl.match(/(\d{15,})/)?.[1];
      if (idMatch) videoId = idMatch;
    } catch {}
  }

  return { videoId, finalUrl };
}

/**
 * 清洗 TikTok MP4 链接
 */
function cleanTikTokUrl(rawUrl) {
  if (!rawUrl) return "";
  let clean = rawUrl
    .replace(/\\u0026/g, "&")
    .replace(/\\u002F/gi, "/")
    .replace(/\\/g, "")
    .replace(/&amp;/g, "&");
  if (clean.startsWith("//")) {
    clean = "https:" + clean;
  }
  return clean;
}

/**
 * 利用正则从 HTML / JSON 文本中精准捕获原装无水印视频 MP4 直链
 */
function extractNoWatermarkVideoByRegex(htmlText) {
  if (!htmlText) return "";

  const cleanText = htmlText
    .replace(/\\u0026/g, "&")
    .replace(/\\u002F/gi, "/")
    .replace(/\\/g, "")
    .replace(/&amp;/g, "&");

  // 1. 搜寻 webapp-prime 域名下的 /video/tos/ 视频直链
  const primeMatches = cleanText.match(
    /https?:\/\/[^"'\s\\]*webapp-prime[^"'\s\\]*\/video\/tos\/[^"'\s\\]*(?:mime_type=video|\.mp4)[^"'\s\\]*/gi
  );
  if (primeMatches && primeMatches.length > 0) {
    const videoMatches = primeMatches.filter((u) => !u.includes("mime_type=audio"));

    // 优先选择标准码率公网畅播流 (bt < 1200)
    const publicStream = videoMatches.find((u) => {
      const btMatch = u.match(/[?&]bt=(\d+)/);
      if (btMatch) {
        const bt = parseInt(btMatch[1], 10);
        return bt > 0 && bt < 1200;
      }
      return false;
    });

    if (publicStream) return cleanTikTokUrl(publicStream);
    if (videoMatches.length > 0) return cleanTikTokUrl(videoMatches[0]);
  }

  // 2. 搜寻 tiktokcdn / tiktokv 域名下的 /video/tos/ 视频直链
  const cdnMatches = cleanText.match(
    /https?:\/\/[^"'\s\\]+(?:tiktokcdn|tiktokv|byteoversea)[^"'\s\\]*\/video\/tos\/[^"'\s\\]*(?:mime_type=video|\.mp4)[^"'\s\\]*/gi
  );
  if (cdnMatches && cdnMatches.length > 0) {
    const valid = cdnMatches.find((u) => !u.includes("mime_type=audio"));
    if (valid) return cleanTikTokUrl(valid);
  }

  return "";
}

async function tiktokParse(shareUrl) {
  try {
    const { videoId, finalUrl } = await extractTikTokInfo(shareUrl);

    if (!videoId) {
      return { code: 400, msg: "无法解析 TikTok 视频 ID，请确保链接格式正确且视频公开可见" };
    }

    logger.log(`[TikTok] 解析视频 ID: ${videoId}, finalUrl: ${finalUrl}`);

    let videoUrl = "";
    let title = "";
    let author = "";
    let avatar = "";
    let cover = "";

    // 策略 1：优先调用 TikWM 无水印直链提取引擎 (100% 准确获取公开畅播无水印 MP4 直链)
    try {
      const tikwmUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(shareUrl)}`;
      const tRes = await fetch(tikwmUrl, {
        headers: { "User-Agent": DESKTOP_UA },
        signal: AbortSignal.timeout(6000),
      });
      if (tRes.ok) {
        const tJson = await tRes.json();
        if (tJson.code === 0 && tJson.data?.play) {
          videoUrl = cleanTikTokUrl(tJson.data.play);
          if (!title) title = tJson.data.title || "";
          if (!author) author = tJson.data.author?.nickname || "";
          if (!avatar) avatar = tJson.data.author?.avatar || "";
          if (!cover) cover = tJson.data.cover || "";
        }
      }
    } catch {}

    // 策略 2：通过 TikTok Embed 网页提炼原装无水印视频 MP4 直链
    if (!videoUrl) {
      try {
        const embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;
        const eRes = await fetch(embedUrl, {
          headers: {
            "User-Agent": DESKTOP_UA,
            "Accept-Language": "en-US,en;q=0.9",
          },
          signal: AbortSignal.timeout(5000),
        });
        if (eRes.ok) {
          const html = await eRes.text();
          videoUrl = extractNoWatermarkVideoByRegex(html);

          if (!title) {
            const tMatch = html.match(/<title>(.*?)<\/title>/i) || html.match(/"title"\s*:\s*"([^"]+)"/i);
            if (tMatch?.[1]) title = tMatch[1].replace(/\| TikTok.*/i, "").trim();
          }
          if (!author) {
            const aMatch = html.match(/"author"\s*:\s*"([^"]+)"/i) || html.match(/@([a-zA-Z0-9_\.]+)/);
            if (aMatch?.[1]) author = aMatch[1];
          }
          if (!cover) {
            const cMatch = html.match(/"poster"\s*:\s*"([^"]+)"/i) || html.match(/"cover"\s*:\s*"([^"]+)"/i);
            if (cMatch?.[1]) cover = cleanTikTokUrl(cMatch[1]);
          }
        }
      } catch {}
    }

    // 策略 3：抓取 Web 详情页 HTML 匹配
    if (!videoUrl) {
      try {
        const webUrl = `https://www.tiktok.com/@tiktok/video/${videoId}`;
        const wRes = await fetch(webUrl, {
          headers: {
            "User-Agent": DESKTOP_UA,
            "Accept-Language": "en-US,en;q=0.9",
          },
          signal: AbortSignal.timeout(6000),
        });
        if (wRes.ok) {
          const html = await wRes.text();
          videoUrl = extractNoWatermarkVideoByRegex(html);

          if (!title) {
            const tMatch = html.match(/<title>(.*?)<\/title>/i) || html.match(/"title"\s*:\s*"([^"]+)"/i);
            if (tMatch?.[1]) title = tMatch[1].replace(/\| TikTok.*/i, "").trim();
          }
          if (!author) {
            const aMatch = html.match(/"author"\s*:\s*"([^"]+)"/i) || html.match(/@([a-zA-Z0-9_\.]+)/);
            if (aMatch?.[1]) author = aMatch[1];
          }
          if (!cover) {
            const cMatch = html.match(/"poster"\s*:\s*"([^"]+)"/i) || html.match(/"cover"\s*:\s*"([^"]+)"/i);
            if (cMatch?.[1]) cover = cleanTikTokUrl(cMatch[1]);
          }
        }
      } catch {}
    }

    // 策略 4：调用 TikTok 官方 App Feed 接口
    if (!videoUrl) {
      try {
        const feedApiUrl = `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${videoId}`;
        const fRes = await fetch(feedApiUrl, {
          headers: { "User-Agent": TIKTOK_APP_UA },
          signal: AbortSignal.timeout(5000),
        });
        if (fRes.ok) {
          const fData = await fRes.json();
          const item = fData?.aweme_list?.[0];
          if (item) {
            if (!title) title = item.desc || "";
            if (!author) author = item.author?.nickname || item.author?.unique_id || "";
            if (!avatar) avatar = item.author?.avatar_thumb?.url_list?.[0] || "";
            if (!cover) cover = item.video?.cover?.url_list?.[0] || "";

            const text = JSON.stringify(item);
            videoUrl = extractNoWatermarkVideoByRegex(text);
          }
        }
      } catch {}
    }

    // 策略 5：调用 TikTok OEmbed 官方 API 补充元数据
    try {
      if (!title || !cover) {
        const oembedUrl = `https://www.tiktok.com/oembed?url=https://www.tiktok.com/@tiktok/video/${videoId}`;
        const oRes = await fetch(oembedUrl, {
          headers: { "User-Agent": DESKTOP_UA },
          signal: AbortSignal.timeout(4000),
        });
        if (oRes.ok) {
          const oData = await oRes.json();
          if (!title) title = oData.title || "";
          if (!author) author = oData.author_name || "";
          if (!cover) cover = oData.thumbnail_url || "";
        }
      }
    } catch {}

    if (!videoUrl) {
      return { code: 404, msg: "未找到 TikTok 视频播放地址，可能是视频设置了私密或限制访问" };
    }

    return {
      code: 200,
      msg: "解析成功",
      data: {
        title: title || "TikTok Video",
        author: author || "TikTok User",
        avatar: avatar || "",
        cover: cover || "",
        url: videoUrl,
      },
    };
  } catch (error) {
    logger.error("Error in tiktokParse:", error);
    return { code: 500, msg: "TikTok 服务器解析失败" };
  }
}

export const GET = createApiHandler(tiktokParse, { shouldCache: false });
