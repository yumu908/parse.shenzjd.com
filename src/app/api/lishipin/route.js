import dns from "node:dns";
import { createApiHandler } from "@/lib/api-middleware";
import { DEFAULT_MOBILE_UA } from "@/lib/default-mobile-ua";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {}

export const runtime = "nodejs";

async function parseVideoId(videoId) {
  const mrd = Math.random();
  const reqUrl = `https://www.pearvideo.com/videoStatus.jsp?contId=${videoId}&mrd=${mrd}`;

  let json = null;
  try {
    const res = await fetch(reqUrl, {
      headers: {
        "Referer": `https://www.pearvideo.com/video_${videoId}`,
        "User-Agent": DEFAULT_MOBILE_UA,
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const text = await res.text();
      try {
        json = JSON.parse(text);
      } catch {}
    }
  } catch {}

  const videoInfo = json?.videoInfo;
  const srcUrl = videoInfo?.videos?.srcUrl;
  const systemTime = String(json?.systemTime || "");

  let videoUrl = "";
  if (srcUrl && systemTime) {
    videoUrl = srcUrl.replace(systemTime, `cont-${videoId}`);
  } else if (srcUrl) {
    videoUrl = srcUrl;
  }

  let title = "";
  let cover = videoInfo?.video_image || "";

  // 抓取 HTML 详情页提取标题、封面以及 MP4 兜底
  try {
    const htmlRes = await fetch(`https://www.pearvideo.com/video_${videoId}`, {
      headers: { "User-Agent": DEFAULT_MOBILE_UA },
      signal: AbortSignal.timeout(6000),
    });

    if (htmlRes.ok) {
      const html = await htmlRes.text();
      const titleMatch =
        html.match(/<h1 class="video-tt">(.*?)<\/h1>/s) ||
        html.match(/<title>(.*?)<\/title>/i);
      if (titleMatch?.[1]) {
        title = titleMatch[1].replace(/_梨视频.*/, "").replace(/<[^>]+>/g, "").trim();
      }

      if (!cover) {
        const coverMatch = html.match(/poster="([^"]+)"/i) || html.match(/src="([^"]+?\.jpg)"/i);
        if (coverMatch?.[1]) cover = coverMatch[1];
      }

      if (!videoUrl) {
        const mp4Match = html.match(/srcUrl="([^"]+)"/i) || html.match(/https?:[^\s"'<>]+?\.mp4[^\s"'<>]*/i);
        if (mp4Match) videoUrl = mp4Match[1] || mp4Match[0];
      }
    }
  } catch {}

  if (videoUrl) {
    return {
      code: 200,
      msg: "解析成功",
      data: {
        title: title || `梨视频 ${videoId}`,
        author: "梨视频",
        avatar: "",
        cover: cover,
        url: videoUrl,
      },
    };
  }

  return { code: 404, msg: "未找到梨视频播放地址" };
}

async function lishipinParse(shareUrl) {
  let videoId = "";

  const m =
    shareUrl.match(/\/video_([0-9]+)/i) ||
    shareUrl.match(/\/detail_([0-9]+)/i) ||
    shareUrl.match(/[?&]contId=([0-9]+)/i) ||
    shareUrl.match(/\/([0-9]{5,})/);

  if (m?.[1]) {
    videoId = m[1];
  }

  if (!videoId) {
    return { code: 400, msg: "无法从分享文本中识别梨视频 ID" };
  }

  return parseVideoId(videoId);
}

export const GET = createApiHandler(lishipinParse);
