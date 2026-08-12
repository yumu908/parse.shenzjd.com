import { createApiHandler } from "@/lib/api-middleware";

export const runtime = "nodejs";

async function parseVideoId(videoId) {
  // 策略 1：调用虎牙 Live API
  try {
    const reqUrl = `https://liveapi.huya.com/moment/getMomentContent?videoId=${videoId}`;
    const res = await fetch(reqUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://v.huya.com/",
      },
    });
    if (res.ok) {
      const json = await res.json();
      const videoData = json?.data?.moment?.videoInfo;
      if (videoData?.definitions?.[0]?.url) {
        return {
          code: 200,
          msg: "解析成功",
          data: {
            title: videoData.videoTitle || "",
            author: videoData.actorNick || "",
            avatar: videoData.actorAvatarUrl || "",
            uid: String(videoData.uid || ""),
            cover: videoData.videoCover || "",
            url: videoData.definitions[0].url,
          },
        };
      }
    }
  } catch {
    // 忽略 API 异常，进入备用降级策略
  }

  // 策略 2：网页 HTML 备用解析（应对 API 风控拦截）
  try {
    const pageUrl = `https://v.huya.com/play/${videoId}.html`;
    const res = await fetch(pageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (res.ok) {
      const html = await res.text();
      const videoUrlMatch =
        html.match(/"definitions"\s*:\s*\[\s*\{\s*"url"\s*:\s*"(https?:[^\"]+)"/i) ||
        html.match(/"url"\s*:\s*"(https?:[^\"]+?\.mp4[^\"]*)"/i);
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);

      if (videoUrlMatch?.[1]) {
        const videoUrl = videoUrlMatch[1].replace(/\\/g, "");
        return {
          code: 200,
          msg: "解析成功",
          data: {
            title: titleMatch ? titleMatch[1].replace(/_虎牙视频.*/, "") : "",
            author: "",
            avatar: "",
            uid: "",
            cover: "",
            url: videoUrl,
          },
        };
      }
    }
  } catch {
    // 忽略
  }

  return {
    code: 404,
    msg: "虎牙视频解析失败",
  };
}

async function huyaParse(shareUrl) {
  const m = shareUrl.match(/\/(\d+)\.html/);
  if (!m?.[1]) {
    return {
      code: 400,
      msg: "无法从虎牙链接解析视频 id",
    };
  }
  return parseVideoId(m[1]);
}

export const GET = createApiHandler(huyaParse);