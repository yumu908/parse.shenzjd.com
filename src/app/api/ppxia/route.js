import { createApiHandler } from "@/lib/api-middleware";
import { logger } from "@/lib/api-utils";

export const runtime = "nodejs";

const TIMEOUT = 8000;
const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function ppxiaParse(url) {
  try {
    let finalUrl = url;
    let htmlContent = "";

    // 1. 发起请求并跟随重定向，提取 HTML
    try {
      const pageRes = await fetch(url, {
        headers: { "User-Agent": UA },
        redirect: "follow",
        signal: AbortSignal.timeout(TIMEOUT),
      });
      finalUrl = pageRes.url;
      if (pageRes.ok) {
        htmlContent = await pageRes.text();
      }
    } catch (e) {
      logger.warn("Pipixia redirect/page fetch error:", e.message);
    }

    // 2. 尝试从页面 HTML 中的 window._ROUTER_DATA 或 window.__INITIAL_STATE__ 解析
    if (htmlContent) {
      const routerMatch =
        htmlContent.match(/window\._ROUTER_DATA\s*=\s*({[\s\S]*?});/) ||
        htmlContent.match(/window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});/) ||
        htmlContent.match(/RENDER_DATA\s*=\s*({[\s\S]*?});/);

      if (routerMatch?.[1]) {
        try {
          const routerData = JSON.parse(routerMatch[1]);
          const loaderData = routerData.loaderData || {};
          let item = null;

          for (const key of Object.keys(loaderData)) {
            if (loaderData[key]?.item) {
              item = loaderData[key].item;
              break;
            }
            if (loaderData[key]?.cell) {
              item = loaderData[key].cell?.item || loaderData[key].cell;
              break;
            }
          }

          if (!item && routerData.item) item = routerData.item;

          if (item) {
            const videoUrl =
              item.video?.video_high?.url_list?.[0]?.url ||
              item.video?.video_download?.url_list?.[0]?.url ||
              item.video?.video_medium?.url_list?.[0]?.url;

            if (videoUrl) {
              return {
                code: 200,
                msg: "解析成功",
                platform: "ppxia",
                data: {
                  author: item.author?.name || "未知作者",
                  avatar: item.author?.avatar?.download_list?.[0]?.url || "",
                  title: item.content || item.share_title || "无标题",
                  cover: item.cover?.download_list?.[0]?.url || item.cover?.url_list?.[0]?.url || "",
                  url: videoUrl,
                },
              };
            }
          }
        } catch {}
      }
    }

    // 3. 提取数字 cell_id / item_id
    const idMatch =
      finalUrl.match(/\/item\/(\d+)/) ||
      finalUrl.match(/\/cell\/(\d+)/) ||
      finalUrl.match(/cell_id=(\d+)/) ||
      finalUrl.match(/item_id=(\d+)/) ||
      finalUrl.match(/\/([0-9]{15,20})/);

    const cellId = idMatch ? idMatch[1] : null;
    if (!cellId) {
      return { code: 400, msg: "无法从 URL 中提取皮皮虾视频 ID" };
    }

    // 4. 调用皮皮虾官方 H5 API (cell/detail & cell_h5_comment)
    const apiUrls = [
      `https://h5.pipix.com/bds/web/cell/detail/?cell_id=${cellId}&cell_type=1`,
      `https://h5.pipix.com/bds/cell/cell_h5_comment/?count=5&aid=1319&app_name=super&cell_id=${cellId}`,
    ];

    for (const apiUrl of apiUrls) {
      try {
        const response = await fetch(apiUrl, {
          headers: { "User-Agent": UA },
          signal: AbortSignal.timeout(TIMEOUT),
        });

        if (response.ok) {
          const data = await response.json();
          const item =
            data?.data?.item ||
            data?.data?.cell?.item ||
            data?.data?.cell_comments?.[1]?.comment_info?.item ||
            data?.data?.cell_comments?.[0]?.comment_info?.item;

          const videoUrl =
            item?.video?.video_high?.url_list?.[0]?.url ||
            item?.video?.video_download?.url_list?.[0]?.url ||
            item?.video?.video_medium?.url_list?.[0]?.url;

          if (videoUrl) {
            return {
              code: 200,
              msg: "解析成功",
              platform: "ppxia",
              data: {
                author: item.author?.name || "未知作者",
                avatar: item.author?.avatar?.download_list?.[0]?.url || "",
                title: item.content || "无标题",
                cover: item.cover?.download_list?.[0]?.url || "",
                url: videoUrl,
              },
            };
          }
        }
      } catch {}
    }

    return { code: 404, msg: "未找到皮皮虾视频数据" };
  } catch (error) {
    logger.error("ppxia parse error:", error);
    return { code: 500, msg: "服务器内部错误" };
  }
}

export const GET = createApiHandler(ppxiaParse);
