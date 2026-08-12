import dns from "node:dns";
import { createApiHandler } from "@/lib/api-middleware";
import { DEFAULT_MOBILE_UA } from "@/lib/default-mobile-ua";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {}

export const runtime = "nodejs";

async function parseVideoId(videoId) {
  // 1. 发起六间房 H5 API 请求 (兼容 HTTP/HTTPS)
  const apiUrls = [
    `http://v.6.cn/coop/mobile/index.php?padapi=minivideo-watchVideo.php&av=3.0&encpass=&logiuid=&isnew=1&from=0&vid=${videoId}`,
    `https://v.6.cn/coop/mobile/index.php?padapi=minivideo-watchVideo.php&av=3.0&encpass=&logiuid=&isnew=1&from=0&vid=${videoId}`,
    `https://m.6.cn/coop/mobile/index.php?padapi=minivideo-watchVideo.php&av=3.0&encpass=&logiuid=&isnew=1&from=0&vid=${videoId}`,
  ];

  for (const apiUrl of apiUrls) {
    try {
      const res = await fetch(apiUrl, {
        headers: {
          "User-Agent": DEFAULT_MOBILE_UA,
          "Referer": `https://v.6.cn/minivideo/${videoId}`,
        },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const json = await res.json();
        const data = json?.content;
        if (data?.playurl) {
          return {
            code: 200,
            msg: "解析成功",
            data: {
              title: data.title || "六间房视频",
              author: data.alias || "",
              avatar: data.picuser || "",
              cover: data.picurl || "",
              url: data.playurl,
            },
          };
        }
      }
    } catch {}
  }

  // 2. 抓取六间房 HTML 详情页备用
  const htmlUrls = [
    `https://v.6.cn/minivideo/${videoId}`,
    `http://v.6.cn/minivideo/${videoId}`,
    `https://m.6.cn/v/${videoId}`,
  ];

  for (const htmlUrl of htmlUrls) {
    try {
      const res = await fetch(htmlUrl, {
        headers: {
          "User-Agent": DEFAULT_MOBILE_UA,
          "Referer": "https://v.6.cn/",
        },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const html = await res.text();
        const videoMatch =
          html.match(/"playurl"\s*:\s*"([^"]+)"/i) ||
          html.match(/"mp4"\s*:\s*"([^"]+)"/i) ||
          html.match(/<video[^>]+src="([^"]+)"/i) ||
          html.match(/https?:[^\s"'<>]+?\.mp4[^\s"'<>]*/i);

        if (videoMatch) {
          const videoUrl = (videoMatch[1] || videoMatch[0]).replace(/\\/g, "");
          const titleMatch = html.match(/<title>(.*?)<\/title>/i) || html.match(/"title"\s*:\s*"([^"]+)"/i);
          const coverMatch = html.match(/"picurl"\s*:\s*"([^"]+)"/i) || html.match(/poster="([^"]+)"/i);

          return {
            code: 200,
            msg: "解析成功",
            data: {
              title: titleMatch?.[1]?.replace(/_六间房.*/, "").trim() || "六间房视频",
              author: "",
              avatar: "",
              cover: coverMatch?.[1]?.replace(/\\/g, "") || "",
              url: videoUrl,
            },
          };
        }
      }
    } catch {}
  }

  return { code: 404, msg: "未找到六间房视频播放地址" };
}

async function sixroomParse(shareUrl) {
  let videoId = "";

  // 独立正则解构六间房短视频 ID (兼容 /minivideo/7457364, /v/7457364, vid=7457364)
  const m =
    shareUrl.match(/[?&]vid=([0-9]+)/i) ||
    shareUrl.match(/\/minivideo\/([0-9]+)/i) ||
    shareUrl.match(/\/v\/([0-9]+)/i) ||
    shareUrl.match(/\/([0-9]{5,})/);

  if (m?.[1]) {
    videoId = m[1];
  }

  if (!videoId) {
    return { code: 400, msg: "无法从六间房链接中解析视频 ID" };
  }

  return parseVideoId(videoId);
}

export const GET = createApiHandler(sixroomParse);
