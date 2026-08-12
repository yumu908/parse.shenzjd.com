import { createApiHandler } from "@/lib/api-middleware";
import { DEFAULT_MOBILE_UA } from "@/lib/default-mobile-ua";

export const runtime = "nodejs";

async function parseVideoId(videoId) {
  // 策略 1：调用好看视频 JSON API
  const reqUrl = `https://haokan.baidu.com/v?_format=json&vid=${videoId}`;
  try {
    const res = await fetch(reqUrl, {
      headers: { "User-Agent": DEFAULT_MOBILE_UA },
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.errno === 0) {
        const data = json.data?.apiData?.curVideoMeta;
        if (data?.playurl || data?.video_src) {
          return {
            code: 200,
            msg: "解析成功",
            data: {
              title: data.title || "",
              author: data.mth?.author_name || "",
              avatar: data.mth?.author_photo || "",
              uid: String(data.mth?.mthid || ""),
              cover: data.poster || "",
              url: data.playurl || data.video_src,
            },
          };
        }
      }
    }
  } catch {}

  // 策略 2：直接抓取 HTML 解构
  try {
    const htmlUrl = `https://haokan.baidu.com/v?vid=${videoId}`;
    const res = await fetch(htmlUrl, {
      headers: { "User-Agent": DEFAULT_MOBILE_UA },
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const html = await res.text();
      const videoMatch =
        html.match(/"playurl"\s*:\s*"([^"]+)"/i) ||
        html.match(/"video_src"\s*:\s*"([^"]+)"/i) ||
        html.match(/<video[^>]+src="([^"]+)"/i) ||
        html.match(/https?:[^\s"'<>]+?\.mp4[^\s"'<>]*/i);

      if (videoMatch) {
        const videoUrl = (videoMatch[1] || videoMatch[0])
          .replace(/\\/g, "")
          .replace(/&amp;/g, "&");
        const titleMatch = html.match(/<title>(.*?)<\/title>/i) || html.match(/"title"\s*:\s*"([^"]+)"/i);
        const authorMatch = html.match(/"author_name"\s*:\s*"([^"]+)"/i);
        const coverMatch = html.match(/"poster"\s*:\s*"([^"]+)"/i) || html.match(/poster="([^"]+)"/i);

        return {
          code: 200,
          msg: "解析成功",
          data: {
            title: titleMatch?.[1]?.replace(/_好看视频.*/, "").trim() || "好看视频",
            author: authorMatch?.[1] || "",
            avatar: "",
            cover: coverMatch?.[1]?.replace(/\\/g, "").replace(/&amp;/g, "&") || "",
            url: videoUrl,
          },
        };
      }
    }
  } catch {}

  return { code: 404, msg: "未找到好看视频播放地址" };
}

async function haokanParse(shareUrl) {
  let vid = "";

  // 从 URL 提取 vid 参数或路径 ID
  const m =
    shareUrl.match(/[?&]vid=([0-9]+)/i) ||
    shareUrl.match(/\/v\?vid=([0-9]+)/i) ||
    shareUrl.match(/\/([0-9]{15,})/);

  if (m?.[1]) {
    vid = m[1];
  }

  if (!vid) {
    return { code: 400, msg: "无法从链接中解析好看视频 vid" };
  }

  return parseVideoId(vid);
}

export const GET = createApiHandler(haokanParse);
