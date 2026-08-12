import { createApiHandler } from "@/lib/api-middleware";
import { decodeMeipaiVideoBs64 } from "@/lib/meipai-decode";

export const runtime = "nodejs";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * 用正则从 HTML 中提取美拍内容
 */
function extractFromHtml(html) {
  const result = {};

  // 1. 优先提取 video data-video 属性 (base64 加密参数)
  const videoMatch = html.match(/data-video="([^"]+)"/i);
  if (videoMatch?.[1]) {
    result.videoBs64 = videoMatch[1];
  }

  // 2. 备用：直接提取原生 .mp4 视频直链 (如 mvvideo*.meitudata.com)
  const mp4Match = html.match(/https?:\/\/[^"'\s\\]+\.mp4[^"'\s\\]*/gi);
  if (mp4Match?.[0]) {
    result.directMp4 = mp4Match[0].replace(/\\/g, "").replace(/&amp;/g, "&");
  }

  // 3. 提取封面图
  const coverMatch =
    html.match(/<img[^>]+src="([^"]+)"[^>]*>/i) ||
    html.match(/data-cover="([^"]+)"/i) ||
    html.match(/poster="([^"]+)"/i) ||
    html.match(/"cover"\s*:\s*"([^"]+)"/i);
  if (coverMatch?.[1]) {
    result.cover = coverMatch[1].replace(/\\/g, "");
  }

  // 4. 提取用户名
  const userNameMatch =
    html.match(/class="detail-avatar"[^>]+alt="([^"]+)"/i) ||
    html.match(/class="user-name"[^>]*>([^<]+)</i) ||
    html.match(/"screen_name"\s*:\s*"([^"]+)"/i);
  if (userNameMatch?.[1]) {
    result.userName = userNameMatch[1].trim();
  }

  // 5. 提取用户头像
  const avatarMatch =
    html.match(/class="detail-avatar"[^>]+src="([^"]+)"/i) ||
    html.match(/"avatar"\s*:\s*"([^"]+)"/i);
  if (avatarMatch?.[1]) {
    result.userAvatar = avatarMatch[1].replace(/\\/g, "");
  }

  // 6. 提取标题
  const titleMatch =
    html.match(/class="detail-cover-title"[^>]*>([^<]+)<\/div>/i) ||
    html.match(/<title>(.*?)<\/title>/i) ||
    html.match(/"caption"\s*:\s*"([^"]+)"/i);
  if (titleMatch?.[1]) {
    result.title = titleMatch[1].replace(/_美拍.*/, "").trim();
  }

  return result;
}

async function meipaiParse(shareUrl) {
  // 1. 规范化协议头 (将 80 端口 HTTP 强制修正为 443 HTTPS 避开连接超时)
  let cleanUrl = shareUrl.trim();
  if (cleanUrl.startsWith("http://")) {
    cleanUrl = "https://" + cleanUrl.slice(7);
  }

  // 提取视频 media ID
  const mediaIdMatch = cleanUrl.match(/([0-9]{15,})/);
  const mediaId = mediaIdMatch?.[1] || "";

  const tryUrls = [
    cleanUrl,
    mediaId ? `https://www.meipai.com/media/${mediaId}` : null,
    mediaId ? `https://m.meipai.com/media/${mediaId}` : null,
  ].filter(Boolean);

  let extracted = {};
  for (const targetUrl of tryUrls) {
    try {
      const res = await fetch(targetUrl, {
        headers: {
          "User-Agent": UA,
          Referer: "https://www.meipai.com/",
        },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const html = await res.text();
        extracted = extractFromHtml(html);
        if (extracted.videoBs64 || extracted.directMp4) {
          break;
        }
      }
    } catch {}
  }

  if (!extracted.videoBs64 && !extracted.directMp4) {
    return { code: 404, msg: "无法解析美拍视频参数，请确保链接有效" };
  }

  let videoUrl = extracted.directMp4 || "";
  if (extracted.videoBs64) {
    try {
      const decoded = decodeMeipaiVideoBs64(extracted.videoBs64);
      if (decoded) videoUrl = decoded;
    } catch {}
  }

  if (!videoUrl) {
    return { code: 400, msg: "美拍地址解码失败" };
  }

  let userAvatar = extracted.userAvatar || "";
  if (userAvatar && !userAvatar.startsWith("http")) {
    userAvatar = `https:${userAvatar}`;
  }

  let coverUrl = extracted.cover || "";
  if (coverUrl.startsWith("//")) {
    coverUrl = `https:${coverUrl}`;
  }

  return {
    code: 200,
    msg: "解析成功",
    data: {
      title: extracted.title || "美拍视频",
      author: extracted.userName || "",
      avatar: userAvatar,
      cover: coverUrl,
      url: videoUrl,
    },
  };
}

export const GET = createApiHandler(meipaiParse);
