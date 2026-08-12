"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import { ApiResponse, GenericParsedData } from "@/types/api";

interface GenericParsedVideoProps {
  data: ApiResponse;
}

// 判断 URL 是否需要通过代理（避免 Mixed Content、CORS 和防盗链拦截）
function proxyUrl(url: string | undefined, referer?: string): string {
  if (!url) return url || "";
  try {
    // 相对路径、本地 API 或 blob 链接不进行代理
    if (url.startsWith("/") || url.startsWith("blob:")) return url;

    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === "localhost" || hostname === "127.0.0.1") return url;

    // 根据 CDN 域名智能设定防盗链 Referer
    let ref = referer || "";
    if (!ref) {
      if (hostname.includes("xhs") || hostname.includes("redbook")) {
        ref = "https://www.xiaohongshu.com/";
      } else if (
        hostname.includes("douyin") ||
        hostname.includes("snssdk") ||
        hostname.includes("aweme") ||
        hostname.includes("iesdouyin")
      ) {
        ref = "https://www.douyin.com/";
      } else if (hostname.includes("weishi") || hostname.includes("qq.com")) {
        ref = "https://h5.weishi.qq.com/";
      } else if (
        hostname.includes("kwai") ||
        hostname.includes("kuaishou") ||
        hostname.includes("gifshow")
      ) {
        ref = "https://www.kuaishou.com/";
      } else if (
        hostname.includes("weibo") ||
        hostname.includes("sina") ||
        hostname.includes("oasis")
      ) {
        ref = "https://weibo.com/";
      } else if (hostname.includes("6.cn") || hostname.includes("xiu123")) {
        ref = "https://v.6.cn/";
      } else if (
        hostname.includes("acfun") ||
        hostname.includes("aixifan") ||
        hostname.includes("ks-cdn")
      ) {
        ref = "https://www.acfun.cn/";
      } else if (
        hostname.includes("bilibili") ||
        hostname.includes("hdslb") ||
        hostname.includes("bilivideo")
      ) {
        ref = "https://www.bilibili.com/";
      } else if (
        hostname.includes("huya") ||
        hostname.includes("msstatic") ||
        hostname.includes("huyacdn")
      ) {
        ref = "https://www.huya.com/";
      } else if (hostname.includes("douyu") || hostname.includes("douyucdn")) {
        ref = "https://v.douyu.com/";
      } else if (hostname.includes("pearvideo")) {
        ref = "https://www.pearvideo.com/";
      } else if (
        hostname.includes("haokan") ||
        hostname.includes("hao123") ||
        hostname.includes("videocc") ||
        hostname.includes("bdstatic") ||
        hostname.includes("vse.baidu") ||
        hostname.includes("sv.baidu") ||
        hostname.includes("fsv.baidu")
      ) {
        ref = "https://haokan.baidu.com/";
      } else if (hostname.includes("meipai") || hostname.includes("meitudata")) {
        ref = "https://www.meipai.com/";
      }
    }

    // TikTok 与 Facebook CDN 支持浏览器直连放行
    if (
      hostname.includes("tiktok") ||
      hostname.includes("tiktokcdn") ||
      hostname.includes("tiktokv") ||
      hostname.includes("byteoversea") ||
      hostname.includes("facebook") ||
      hostname.includes("fbcdn")
    ) {
      return url;
    }

    return `/api/proxy?url=${encodeURIComponent(url)}${
      ref ? `&referer=${encodeURIComponent(ref)}` : ""
    }`;
  } catch {}
  return url;
}

export default function GenericParsedVideo({ data }: GenericParsedVideoProps) {
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const d = data?.data as GenericParsedData;
  const rawUrl = d?.url || "";
  const videoUrl = proxyUrl(rawUrl);
  const images = d?.images?.filter(Boolean) || [];

  React.useEffect(() => {
    if (!videoUrl || !videoRef.current) return;

    const isM3u8 = rawUrl.toLowerCase().includes(".m3u8") || videoUrl.toLowerCase().includes(".m3u8");
    let hls: any = null;

    if (isM3u8) {
      import("hls.js")
        .then((HlsModule) => {
          const Hls = HlsModule.default;
          if (Hls.isSupported() && videoRef.current) {
            hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
            });
            hls.loadSource(videoUrl);
            hls.attachMedia(videoRef.current);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              setVideoError(null);
            });
            hls.on(Hls.Events.ERROR, (_: any, errData: any) => {
              if (errData.fatal) {
                setVideoError("m3u8 流媒体播放失败，可复制直链在浏览器打开");
              }
            });
          } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
            videoRef.current.src = videoUrl;
          }
        })
        .catch(() => {
          if (videoRef.current) {
            videoRef.current.src = videoUrl;
          }
        });
    }
    // 注意：非 m3u8 的普通 MP4 视频完全交由 JSX 上的 src={videoUrl} 触发加载，
    // 严禁在此处二次执行 videoRef.current.src = videoUrl 重复赋值，避免触发浏览器打断 onError 伪报错。

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoUrl, rawUrl]);

  if (!data.data) {
    return null;
  }

  const isM3u8 = rawUrl.toLowerCase().includes(".m3u8") || videoUrl.toLowerCase().includes(".m3u8");

  return (
    <div className="space-y-5" style={{ touchAction: "pan-y" }}>
      <div className="glass-card p-5">
        <div className="flex items-center gap-4">
          {d.avatar && (
            <Image
              src={proxyUrl(d.avatar)}
              alt={d.author || ""}
              width={56}
              height={56}
              className="rounded-full border-2 border-glass-3"
              unoptimized
            />
          )}
          <div className="flex-1 min-w-0">
            {d.title && (
              <h2 className="text-lg font-semibold text-primary line-clamp-3 mb-1">
                {d.title}
              </h2>
            )}
            {d.author && (
              <p className="text-sm text-muted">{d.author}</p>
            )}
          </div>
        </div>
      </div>

      {videoUrl && (
        <div className="glass-card overflow-hidden">
          <video
            ref={videoRef}
            src={isM3u8 ? undefined : videoUrl}
            poster={proxyUrl(d.cover)}
            controls
            playsInline
            referrerPolicy="no-referrer"
            className="w-full max-h-[70vh] bg-black"
            onError={() => {
              // 关键防护：如果视频实际已经缓冲加载 (readyState >= 2)，忽略浏览器打断引发的伪 onError 报错
              if (videoRef.current && videoRef.current.readyState >= 2) {
                setVideoError(null);
                return;
              }
              setVideoError("视频加载失败，可复制直链在浏览器打开");
            }}
            onCanPlay={() => setVideoError(null)}
            onLoadedData={() => setVideoError(null)}
          />
          {videoError && (
            <p className="p-3 text-sm text-amber-400">{videoError}</p>
          )}
        </div>
      )}

      {!videoUrl && d.cover && (
        <div className="glass-card overflow-hidden">
          <Image
            src={proxyUrl(d.cover)}
            alt=""
            width={800}
            height={450}
            className="w-full h-auto object-contain max-h-[70vh]"
            unoptimized
          />
        </div>
      )}

      {videoUrl && (
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a
            href={`/api/proxy?url=${encodeURIComponent(rawUrl)}&disposition=attachment&filename=${encodeURIComponent((d?.title || "video").replace(/[\\/:*?"<>|]/g, "_").slice(0, 60) + ".mp4")}`}
            download={`${d?.title || "video"}.mp4`}
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5">
            <svg
              className="w-4 h-4 transition-transform group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            下载视频
          </a>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(rawUrl);
              alert("已复制视频 m3u8/mp4 直链地址到剪贴板！");
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-glass-2 hover:bg-glass-3 text-primary rounded-xl font-medium text-sm transition-all duration-300 border border-border-subtle hover:border-accent">
            <svg
              className="w-4 h-4 text-muted group-hover:text-accent transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            复制 m3u8/MP4 直链
          </button>

          <a
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-glass-2 hover:bg-glass-3 text-primary rounded-xl font-medium text-sm transition-all duration-300 border border-border-subtle">
            <svg
              className="w-4 h-4 text-muted group-hover:text-accent transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            打开原 m3u8 链接
          </a>
        </div>
      )}
    </div>
  );
}
