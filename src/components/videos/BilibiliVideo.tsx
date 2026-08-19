"use client";
import React, { useState } from "react";
import Image from "next/image";
import { ApiResponse } from "@/types/api";

interface BilibiliVideoProps {
  data: ApiResponse;
}

interface BilibiliPageItem {
  title?: string;
  duration?: number;
  durationFormat?: string;
  accept?: string[];
  url?: string;
  video_url?: string;
}

export default function BilibiliVideo({ data }: BilibiliVideoProps) {
  const [videoError, setVideoError] = useState<string | null>(null);

  // 兼容新版 data 扁平结构与旧版 data 数组结构
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawData = (data.data || {}) as Record<string, any>;
  const isLegacyArray = Array.isArray(rawData);

  const title = isLegacyArray ? (data.title || "") : (rawData.title || data.title || "");
  const authorName = isLegacyArray ? (data.user?.name || "") : (rawData.author || data.user?.name || "");
  const authorAvatar = isLegacyArray ? (data.user?.user_img || "") : (rawData.avatar || data.user?.user_img || "");
  const coverUrl = isLegacyArray ? (data.imgurl || "") : (rawData.cover || data.imgurl || "");
  const mainVideoUrl = isLegacyArray ? (rawData[0]?.video_url || rawData[0]?.url || "") : (rawData.url || "");

  const pages: BilibiliPageItem[] = !isLegacyArray && Array.isArray(rawData.pages)
    ? rawData.pages
    : isLegacyArray
    ? rawData
    : mainVideoUrl
    ? [{ title: title || "视频 1", url: mainVideoUrl }]
    : [];

  const hasVideo = Boolean(mainVideoUrl || pages.length > 0);
  const primaryVideoProxyUrl = mainVideoUrl
    ? `/api/proxy?url=${encodeURIComponent(mainVideoUrl)}&disposition=inline`
    : "";
  const posterProxyUrl = coverUrl
    ? `/api/proxy?url=${encodeURIComponent(coverUrl)}&disposition=inline`
    : undefined;

  const handleVideoError = (
    e: React.SyntheticEvent<HTMLVideoElement, Event>
  ) => {
    const video = e.currentTarget;
    setVideoError(`视频加载失败: ${video.error?.message || "网络错误"}`);
  };

  const handleVideoLoad = () => {
    setVideoError(null);
  };

  return (
    <div className="space-y-5" style={{ touchAction: 'pan-y' }}>
      {/* Author Info Card */}
      {(authorAvatar || title) && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-4">
            {authorAvatar && (
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#00aeec] to-[#4dc9ff] blur-sm opacity-50" />
                <Image
                  src={`/api/proxy?url=${encodeURIComponent(authorAvatar)}`}
                  alt={authorName || "UP主"}
                  width={56}
                  height={56}
                  className="relative rounded-full border-2 border-glass-3"
                  unoptimized
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && (
                <h2 className="text-lg font-semibold text-primary line-clamp-2 mb-1">
                  {title}
                </h2>
              )}
              {authorName && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-secondary">UP主</span>
                  <span className="text-sm font-medium text-accent">{authorName}</span>
                </div>
              )}
            </div>

            {/* Bilibili Logo */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00aeec] to-[#4dc9ff] flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Player */}
      {coverUrl && hasVideo && (
        <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl">
          <div className="aspect-video w-full">
            <video
              controls
              poster={posterProxyUrl}
              className="w-full h-full object-contain"
              preload="metadata"
              playsInline
              onError={handleVideoError}
              onLoadedData={handleVideoLoad}>
              <source src={primaryVideoProxyUrl} type="video/mp4" />
              <p className="text-center text-gray-500 p-4">
                您的浏览器不支持视频播放
              </p>
            </video>
          </div>

          {videoError && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center text-white p-6">
                <p className="mb-4 text-sm">{videoError}</p>
                <a
                  href={primaryVideoProxyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00aeec] hover:bg-[#0099d4] text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#00aeec]/25">
                  在新窗口打开
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Download Options */}
      {hasVideo && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-accent"
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
            下载选项 ({pages.length})
          </h3>

          <div className="space-y-3">
            {pages.map((item: BilibiliPageItem, index: number) => {
              const itemVideoUrl = item.url || item.video_url || mainVideoUrl;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-glass-2 hover:bg-glass-3 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-accent">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">
                        {item.title || `视频 ${index + 1}`}
                      </p>
                      {item.durationFormat && (
                        <p className="text-xs text-muted">{item.durationFormat}</p>
                      )}
                    </div>
                  </div>

                  <a
                    href={`/api/proxy?url=${encodeURIComponent(
                      itemVideoUrl
                    )}&filename=${encodeURIComponent(
                      (title || "bilibili") + `-${index + 1}`
                    )}&disposition=attachment`}
                    download
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00aeec] to-[#4dc9ff] hover:from-[#0099d4] hover:to-[#3db8e8] text-white rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#00aeec]/25 hover:-translate-y-0.5">
                    <svg
                      className="w-4 h-4"
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
                    下载
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
