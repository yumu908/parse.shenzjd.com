import type { VideoPlatformKey } from "@/config/video-platforms";

export type Platform = VideoPlatformKey;

// 提取文本中的第一个 URL（包含常见分享文案里的 URL）
export function extractUrl(text: string): string | null {
  const httpUrl = text.match(
    /(https?:\/\/[^\s\u3000\u00A0，。！？、；：【】（）《》“”‘’]+)/
  );
  if (httpUrl && httpUrl[1]) {
    return httpUrl[1].replace(/[，。！？、；：.,!?;]+$/, "");
  }

  const bareUrlMatch = text.match(
    /(?:^|\s)((?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\/[^\s\u3000\u00A0，。！？、；：【】（）《》“”‘’]+)/
  );
  if (bareUrlMatch && bareUrlMatch[1]) {
    return bareUrlMatch[1].replace(/[，。！？、；：.,!?;]+$/, "");
  }

  return null;
}

/** 是否包含任一受支持平台的 URL 片段（用于剪贴板自动读取等） */
export function hasValidVideoUrl(text: string): boolean {
  const supported = [
    "douyin.com",
    "iesdouyin.com",
    "v.douyin.com",
    "snssdk.com",
    "kuaishou.com",
    "v.kuaishou.com",
    "weibo.com",
    "weibo.cn",
    "video.weibo.com",
    "oasis.weibo.cn",
    "xiaohongshu.com",
    "xhslink.com",
    "bilibili.com",
    "b23.tv",
    "music.douyin.com",
    "h5.pipigx.com",
    "h5.ippzone.com",
    "ippzone.com",
    "pipigx.com",
    "h5.pipix.com",
    "pipix.com",
    "share.huoshan.com",
    "huoshan.com",
    "weishi.qq.com",
    "ixigua.com",
    "xiaochuankeji.cn",
    "xspshare.baidu.com",
    "pearvideo.com",
    "huya.com",
    "v.huya.com",
    "douyu.com",
    "v.douyu.com",
    "vmobile.douyu.com",
    "acfun.cn",
    "meipai.com",
    "doupai.cc",
    "kg.qq.com",
    "xinpianchang.com",
    "haokan.baidu.com",
    "haokan.hao123.com",
    "twitter.com",
    "x.com",
    "t.co",
    "6.cn",
  ];
  const t = text.toLowerCase();
  return supported.some((d) => t.includes(d));
}

/**
 * 从分享文本中过滤提取出 URL 链接，再严格根据该 URL 的 Host 域名判定所属平台
 */
export function detectPlatform(text: string): VideoPlatformKey {
  // 1. 优先从分享文本中过滤提取出干净的 URL
  const rawUrl = extractUrl(text);
  if (!rawUrl) return "douyin";

  // 2. 解析提取出的 URL 主机名
  let host = "";
  try {
    const href = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
    host = new URL(href).hostname.toLowerCase();
  } catch { }

  if (!host) return "douyin";

  // 3. 严格基于提取出的 URL 域名判定平台 (特异性子域名优先匹配)
  if (
    host === "qishui.douyin.com" ||
    host.endsWith(".qishui.douyin.com") ||
    host === "music.douyin.com" ||
    host.endsWith(".music.douyin.com")
  ) {
    return "qsmusic";
  }
  if (host === "pipix.com" || host.endsWith(".pipix.com")) return "ppxia";
  if (
    host === "pipigx.com" ||
    host.endsWith(".pipigx.com") ||
    host === "ippzone.com" ||
    host.endsWith(".ippzone.com")
  ) {
    return "pipigx";
  }
  if (
    host === "twitter.com" ||
    host.endsWith(".twitter.com") ||
    host === "x.com" ||
    host.endsWith(".x.com") ||
    host === "t.co"
  ) {
    return "twitter";
  }
  if (
    (host === "douyin.com" ||
      host.endsWith(".douyin.com") ||
      host === "iesdouyin.com" ||
      host.endsWith(".iesdouyin.com") ||
      host === "snssdk.com") &&
    !host.includes("qishui") &&
    !host.includes("music")
  ) {
    return "douyin";
  }
  if (
    host === "kuaishou.com" ||
    host.endsWith(".kuaishou.com") ||
    host === "kuaishoup.com"
  ) {
    return "kuaishou";
  }
  if (
    host === "bilibili.com" ||
    host.endsWith(".bilibili.com") ||
    host === "b23.tv"
  ) {
    return "bilibili";
  }
  if (
    host === "xiaohongshu.com" ||
    host.endsWith(".xiaohongshu.com") ||
    host === "xhslink.com"
  ) {
    return "xhs";
  }
  if (
    host === "oasis.weibo.cn" ||
    host.endsWith(".oasis.weibo.cn") ||
    host === "oasis.weibo.com" ||
    host.endsWith(".oasis.weibo.com") ||
    host.includes("oasis")
  ) {
    return "lvzhou";
  }
  if (
    (host === "weibo.com" ||
      host.endsWith(".weibo.com") ||
      host === "weibo.cn" ||
      host.endsWith(".weibo.cn")) &&
    !host.includes("oasis")
  ) {
    return "weibo";
  }
  if (host === "huya.com" || host.endsWith(".huya.com")) return "huya";
  if (host === "douyu.com" || host.endsWith(".douyu.com")) return "douyu";
  if (host === "acfun.cn" || host.endsWith(".acfun.cn")) return "acfun";
  if (host === "pearvideo.com" || host.endsWith(".pearvideo.com")) return "lishipin";
  if (host === "ixigua.com" || host.endsWith(".ixigua.com")) return "xigua";
  if (host === "huoshan.com" || host.endsWith(".huoshan.com")) return "huoshan";
  if (
    host === "weishi.qq.com" ||
    host.endsWith(".weishi.qq.com") ||
    host.includes("weishi")
  ) {
    return "weishi";
  }
  if (
    host === "izuiyou.com" ||
    host.endsWith(".izuiyou.com") ||
    host.endsWith(".xiaochuankeji.cn") ||
    host.endsWith(".xiaochuankeji.com")
  ) {
    return "zuiyou";
  }
  if (host.includes("haokan.baidu.com") || host.includes("haokan.hao123.com")) return "haokan";
  if (host.includes("quanmin.baidu.com") || host.includes("xspshare.baidu.com")) return "quanmin";
  if (host === "meipai.com" || host.endsWith(".meipai.com")) return "meipai";
  if (host === "doupai.cc" || host.endsWith(".doupai.cc")) return "doupai";
  if (host === "kg.qq.com" || host.endsWith(".kg.qq.com")) return "quanminkge";
  if (host === "6.cn" || host.endsWith(".6.cn")) return "sixroom";
  if (host === "xinpianchang.com" || host.endsWith(".xinpianchang.com")) return "xinpianchang";

  // 2. 降级包含匹配
  const lower = rawUrl.toLowerCase();
  if (lower.includes("music.douyin.com") || lower.includes("qishui.douyin.com")) return "qsmusic";
  if (lower.includes("pipix.com")) return "ppxia";
  if (lower.includes("pipigx.com") || lower.includes("ippzone.com")) return "pipigx";

  return "douyin";
}

export function extractUrlFromText(text: string): string | null {
  const httpUrl = text.match(
    /(https?:\/\/[^\s\u3000\u00A0，。！？、；：【】（）《》"'"'"'"]+)/
  );
  if (httpUrl && httpUrl[1]) {
    return httpUrl[1].replace(/[，。！？、；：.,!?;]+$/, "");
  }

  const bareUrlMatch = text.match(
    /(?:^|\s)((?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\/[^\s\u3000\u00A0，。！？、；：【】（）《》"'"'"'"]+)/
  );
  if (bareUrlMatch && bareUrlMatch[1]) {
    return bareUrlMatch[1].replace(/[，。！？、；：.,!?;]+$/, "");
  }

  return null;
}
