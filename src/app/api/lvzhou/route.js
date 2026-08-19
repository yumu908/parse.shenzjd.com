import { createApiHandler } from "@/lib/api-middleware";
import { DEFAULT_MOBILE_UA } from "@/lib/default-mobile-ua";

export const runtime = "nodejs";

/**
 * 从 HTML / JSON 字符串中全方位提取媒体与元数据
 */
function extractFromHtml(html) {
  const result = {};

  // 1. 提取视频地址
  const videoMatch =
    html.match(/<video[^>]+src="([^"]+)"/i) ||
    html.match(/"video_url"\s*:\s*"([^"]+)"/i) ||
    html.match(/"url"\s*:\s*"(https?:[^\"]+?\.mp4[^\"]*)"/i) ||
    html.match(/src="([^"]+?\.mp4[^"]*)"/i) ||
    html.match(/https?:\/\/[^\s"'<>]+?\.mp4[^\s"'<>]*/i);

  if (videoMatch) {
    result.videoUrl = (videoMatch[1] || videoMatch[0])
      .replace(/\\/g, "")
      .replace(/&amp;/g, "&");
  }

  // 2. 提取图集/图片列表
  const images = [];
  const imgMatches = html.matchAll(/<img[^>]+src="([^"]+)"/gi);
  for (const m of imgMatches) {
    if (m[1] && (m[1].includes("sinaimg.cn") || m[1].includes("weibo.cn")) && !m[1].includes("avatar")) {
      images.push(m[1].replace(/\\/g, "").replace(/&amp;/g, "&"));
    }
  }
  if (images.length > 0) {
    result.images = images;
  }

  // 3. 提取作者头像
  const avatarMatch =
    html.match(/<a[^>]+class="avatar"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i) ||
    html.match(/"avatar_hd"\s*:\s*"([^"]+)"/i) ||
    html.match(/"avatar"\s*:\s*"([^"]+)"/i);
  if (avatarMatch?.[1]) {
    result.authorAvatar = avatarMatch[1].replace(/\\/g, "").replace(/&amp;/g, "&");
  }

  // 4. 提取封面图
  const coverMatch =
    html.match(/background-image:url\(([^)]+)\)/i) ||
    html.match(/"cover"\s*:\s*"([^"]+)"/i) ||
    html.match(/"poster"\s*:\s*"([^"]+)"/i);
  if (coverMatch?.[1]) {
    result.coverUrl = coverMatch[1].replace(/\\/g, "").replace(/&amp;/g, "&");
  } else if (images.length > 0) {
    result.coverUrl = images[0];
  }

  // 5. 提取标题/文案
  const titleMatch =
    html.match(/class="status-title"[^>]*>([^<]+)<\/div>/i) ||
    html.match(/class="title"[^>]*>([^<]+)</i) ||
    html.match(/<title>(.*?)<\/title>/i) ||
    html.match(/"title"\s*:\s*"([^"]+)"/i);
  if (titleMatch?.[1]) {
    result.title = titleMatch[1].replace(/_绿洲.*/, "").trim();
  }

  // 6. 提取作者昵称
  const authorMatch =
    html.match(/class="nickname"[^>]*>([^<]+)<\/div>/i) ||
    html.match(/"screen_name"\s*:\s*"([^"]+)"/i) ||
    html.match(/"name"\s*:\s*"([^"]+)"/i);
  if (authorMatch?.[1]) {
    result.author = authorMatch[1].trim();
  }

  return result;
}

async function lvzhouParse(shareUrl) {
  try {
    const res = await fetch(shareUrl, {
      headers: { "User-Agent": DEFAULT_MOBILE_UA },
    });
    const html = await res.text();
    const extracted = extractFromHtml(html);

    if (extracted.videoUrl) {
      return {
        code: 200,
        msg: "解析成功",
        platform: "lvzhou",
        data: {
          title: extracted.title || "绿洲动态",
          author: extracted.author || "",
          avatar: extracted.authorAvatar || "",
          cover: extracted.coverUrl || "",
          url: extracted.videoUrl,
        },
      };
    }

    if (extracted.images && extracted.images.length > 0) {
      return {
        code: 200,
        msg: "解析成功",
        platform: "lvzhou",
        data: {
          title: extracted.title || "绿洲动态",
          author: extracted.author || "",
          avatar: extracted.authorAvatar || "",
          cover: extracted.coverUrl || extracted.images[0],
          url: extracted.images[0],
          images: extracted.images,
        },
      };
    }

    return { code: 404, msg: "未能在绿洲页面中找到可解析的媒体资源" };
  } catch {
    return { code: 500, msg: "绿洲解析请求失败" };
  }
}

export const GET = createApiHandler(lvzhouParse);
