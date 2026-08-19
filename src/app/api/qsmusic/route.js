import { createApiHandler } from "@/lib/api-middleware";
import { logger } from "@/lib/api-utils";

export const runtime = "nodejs";

const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function getMusicInfo(url) {
  try {
    let trackId = null;
    let finalUrl = url;
    let pageHtml = "";

    // 1. 先进行手动重定向检查 (提取 Location 中的 track_id)
    try {
      const manualRes = await fetch(url, {
        headers: { "User-Agent": UA },
        redirect: "manual",
        signal: AbortSignal.timeout(5000),
      });

      const location = manualRes.headers.get("location");
      if (location) {
        finalUrl = location;
        const locMatch = location.match(/track_id=(\d+)/) || location.match(/track\/(\d+)/);
        if (locMatch?.[1]) {
          trackId = locMatch[1];
        }
      }
    } catch {}

    // 2. 如果未能在 Location 中提取到，发起跟进重定向获取页面 HTML
    if (!trackId) {
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": UA },
          redirect: "follow",
          signal: AbortSignal.timeout(8000),
        });
        finalUrl = res.url;
        if (res.ok) {
          pageHtml = await res.text();
        }
      } catch (e) {
        logger.warn("Qishui fetch redirect error:", e.message);
      }
    }

    // 3. 尝试从 finalUrl 提取 track_id
    if (!trackId) {
      const match = finalUrl.match(/track_id=(\d+)/) || finalUrl.match(/track\/(\d+)/);
      if (match?.[1]) {
        trackId = match[1];
      }
    }

    // 4. 从页面 HTML 中匹配 track_id
    if (!trackId && pageHtml) {
      const htmlMatch =
        pageHtml.match(/track_id=(\d+)/) ||
        pageHtml.match(/"track_id"\s*:\s*"?(\d+)"?/) ||
        pageHtml.match(/track\/(\d+)/);
      if (htmlMatch?.[1]) {
        trackId = htmlMatch[1];
      }
    }

    if (!trackId) {
      if (pageHtml) {
        const jsMatch = pageHtml.match(/_ROUTER_DATA\s*=\s*({[\s\S]*?});/);
        if (jsMatch?.[1]) {
          try {
            const jsonData = JSON.parse(jsMatch[1].trim());
            const trackPage = jsonData.loaderData?.track_page;
            const musicUrl = trackPage?.audioWithLyricsOption?.url || trackPage?.track?.audio_url;
            const title = trackPage?.track?.title || trackPage?.track?.name || "";
            const cover = trackPage?.track?.cover_url || trackPage?.track?.avatar_url || "";

            if (musicUrl || title) {
              return {
                code: 200,
                msg: "解析成功",
                platform: "qsmusic",
                data: {
                  author: trackPage?.track?.artist_name || trackPage?.track?.author || "汽水音乐",
                  avatar: trackPage?.track?.avatar_url || "",
                  title: title || "无标题",
                  url: musicUrl || "",
                  cover: cover,
                  core: "汽水音乐",
                },
              };
            }
          } catch {}
        }
      }
      return { code: 400, msg: "无法提取汽水音乐 Track ID" };
    }

    // 4. 请求官方分享详情页接口
    const apiRes = await fetch(
      `https://music.douyin.com/qishui/share/track?track_id=${trackId}`,
      {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!apiRes.ok) {
      return { code: 404, msg: "获取汽水音乐详情失败" };
    }

    const html = await apiRes.text();
    let title = "";
    let cover = "";
    let musicUrl = "";
    let lyrics = "";
    let author = "";
    let avatar = "";

    // 提取 LD+JSON 数据
    const ldJsonMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/s);
    if (ldJsonMatch?.[1]) {
      try {
        const ldData = JSON.parse(decodeURIComponent(ldJsonMatch[1]));
        title = ldData.title || ldData.name || "";
        cover = ldData.images?.[0] || "";
      } catch {}
    }

    // 提取 _ROUTER_DATA 数据
    const routerMatch = html.match(/_ROUTER_DATA\s*=\s*({[\s\S]*?});/);
    if (routerMatch?.[1]) {
      try {
        const jsonData = JSON.parse(routerMatch[1].trim());
        const trackPage = jsonData.loaderData?.track_page;
        musicUrl = trackPage?.audioWithLyricsOption?.url || trackPage?.track?.audio_url || "";
        if (!title) title = trackPage?.track?.title || trackPage?.track?.name || "";
        if (!cover) cover = trackPage?.track?.cover_url || "";
        author = trackPage?.track?.artist_name || trackPage?.track?.author || "";
        avatar = trackPage?.track?.avatar_url || "";

        // 解析歌词
        const sentences = trackPage?.audioWithLyricsOption?.lyrics?.sentences || [];
        const lrcLyrics = sentences
          .filter((s) => s.startMs && s.words)
          .map((sentence) => {
            const startMs = sentence.startMs;
            const sentenceText = sentence.words.map((w) => w.text).join("");
            const minutes = Math.floor(startMs / 60000);
            const seconds = Math.floor((startMs % 60000) / 1000);
            const milliseconds = startMs % 1000;
            return `[${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}]${sentenceText}`;
          });
        lyrics = lrcLyrics.join("\n");
      } catch {}
    }

    if (!musicUrl && !title) {
      return { code: 404, msg: "未找到汽水音乐播放地址" };
    }

    return {
      code: 200,
      msg: "解析成功",
      platform: "qsmusic",
      data: {
        author: author || "汽水音乐",
        avatar: avatar,
        title: title || "无标题",
        url: musicUrl,
        cover: cover,
        lyrics: lyrics,
        core: "汽水音乐",
      },
    };
  } catch (error) {
    logger.error("qsmusic parse error:", error);
    return { code: 500, msg: "服务器内部错误" };
  }
}

export const GET = createApiHandler(getMusicInfo);
