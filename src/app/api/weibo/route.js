import dns from "node:dns";
import fs from "node:fs";
import path from "node:path";
import { createApiHandler } from "@/lib/api-middleware";
import { DEFAULT_MOBILE_UA } from "@/lib/default-mobile-ua";

// 彻底清除坏掉的本地系统代理配置
delete process.env.http_proxy;
delete process.env.HTTP_PROXY;
delete process.env.https_proxy;
delete process.env.HTTPS_PROXY;

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {}

export const runtime = "nodejs";

/**
 * 动态获取 WEIBO_COOKIE（支持从 .env.local 实时读取，无需重启开发服务器）
 */
function getWeiboCookie() {
  if (process.env.WEIBO_COOKIE) {
    return process.env.WEIBO_COOKIE;
  }
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/WEIBO_COOKIE\s*=\s*["']?([^"'\r\n]+)["']?/);
      if (match?.[1]) {
        return match[1];
      }
    }
  } catch {}
  return "";
}

async function weiboRequest(id, mid = "") {
  const cleanId = String(id).split("&")[0].split("?")[0].trim();
  const cleanMid = String(mid).split("&")[0].split("?")[0].trim();
  const cookie = getWeiboCookie();

  console.log(`Weibo parsing for cleanId: ${cleanId}, cleanMid: ${cleanMid}, Cookie set: ${Boolean(cookie)}`);

  // 1. 优先尝试 weibo.com/tv/api/component 官方 POST 接口
  try {
    const postData = `data={\"Component_Play_Playinfo\":{\"oid\":\"${cleanId}\"}}`;
    const response = await fetch(
      `https://weibo.com/tv/api/component?page=/tv/show/${cleanId}`,
      {
        method: "POST",
        headers: {
          Cookie: cookie,
          Referer: `https://weibo.com/tv/show/${cleanId}`,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: postData,
        signal: AbortSignal.timeout(3500),
      }
    );

    if (response.ok) {
      const json = await response.json();
      const playInfo = json?.data?.Component_Play_Playinfo;
      if (playInfo?.urls) {
        let videoUrl = Object.values(playInfo.urls)[0];
        if (videoUrl) {
          if (videoUrl.startsWith("//")) {
            videoUrl = "https:" + videoUrl;
          }
          return {
            author: playInfo.author || "",
            avatar: playInfo.avatar || "",
            time: playInfo.real_date || "",
            title: playInfo.title || "微博视频",
            cover: playInfo.cover_image || "",
            url: videoUrl,
          };
        }
      }
    }
  } catch (e) {
    console.log("weibo.com component fetch notice:", e.message);
  }

  // 2. 备用尝试 m.weibo.cn 移动端接口 (结合 mid / fid 组合降级)
  const mobileUrls = [];
  if (cleanMid) {
    mobileUrls.push(`https://m.weibo.cn/statuses/show?id=${cleanMid}`);
    mobileUrls.push(`https://m.weibo.cn/detail/${cleanMid}`);
  }
  if (cleanId) {
    mobileUrls.push(`https://m.weibo.cn/s/video/show?object_id=${cleanId}`);
    mobileUrls.push(`https://m.weibo.cn/statuses/show?id=${cleanId.replace(/^1034:/, "")}`);
  }

  for (const mUrl of mobileUrls) {
    try {
      const response = await fetch(mUrl, {
        headers: {
          "User-Agent": DEFAULT_MOBILE_UA,
          Referer: "https://m.weibo.cn/",
          Cookie: cookie,
        },
        signal: AbortSignal.timeout(3500),
      });

      if (response.ok) {
        const json = await response.json();
        const obj = json?.data?.object || json?.data?.status || json?.data;
        const media = obj?.page_info?.media_info || obj?.media_info;
        let videoUrl =
          media?.stream_url_hd ||
          media?.stream_url ||
          media?.mp4_hd_url ||
          obj?.stream?.hd_url ||
          obj?.stream?.url;

        if (videoUrl) {
          if (videoUrl.startsWith("//")) {
            videoUrl = "https:" + videoUrl;
          }
          return {
            author: obj?.author?.screen_name || obj?.user?.screen_name || "",
            avatar: obj?.author?.profile_image_url || obj?.user?.profile_image_url || "",
            time: obj?.created_at || "",
            title: obj?.summary || obj?.status_title || obj?.page_info?.page_title || "微博视频",
            cover: obj?.page_pic?.url || obj?.page_info?.page_pic?.url || "",
            url: videoUrl,
          };
        }
      }
    } catch (e) {
      console.log("m.weibo.cn fetch notice:", e.message);
    }
  }

  return null;
}

async function weibo(url) {
  try {
    let id = "";
    let mid = "";

    const midMatch = url.match(/[?&]mid=([0-9]+)/i);
    if (midMatch?.[1]) {
      mid = midMatch[1];
    }

    const fidMatch =
      url.match(/[?&]fid=([0-9a-zA-Z:]+)/i) ||
      url.match(/(1034:[0-9]+)/i) ||
      url.match(/\/show\/([0-9a-zA-Z:]+)/i) ||
      url.match(/\/([0-9]{10,})/);

    if (fidMatch?.[1]) {
      id = fidMatch[1];
    }

    if (!id && !mid) {
      return { code: 400, msg: "无法从微博链接中提取视频 ID" };
    }

    const data = await weiboRequest(id, mid);

    if (data && data.url) {
      return {
        code: 200,
        msg: "解析成功",
        data: data,
      };
    }

    return {
      code: 404,
      msg: "该微博视频触发了官方防刷保护（可在根目录 .env.local 中配置 WEIBO_COOKIE 环境凭证解封）",
    };
  } catch (e) {
    return { code: 500, msg: "解析微博视频失败：" + e.message };
  }
}

export const GET = createApiHandler(weibo);
