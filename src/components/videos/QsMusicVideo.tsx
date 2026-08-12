"use client";
import React, { useState } from "react";
import Image from "next/image";
import { ApiResponse, QsMusicData } from "@/types/api";

interface QsMusicVideoProps {
  data: ApiResponse;
}

export default function QsMusicVideo({ data }: QsMusicVideoProps) {
  const [showLyrics, setShowLyrics] = useState(false);

  if (!data.data) {
    return null;
  }

  const musicData = data.data as QsMusicData;

  return (
    <>
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 mb-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          {musicData.cover && (
            <Image
              src={`/api/proxy?url=${encodeURIComponent(musicData.cover)}`}
              alt={musicData.name || "音乐封面"}
              width={80}
              height={80}
              className="rounded-lg shadow-lg object-cover"
              unoptimized
            />
          )}
          <div>
            <h2 className="text-2xl font-bold mb-2">{musicData.name}</h2>
            <p className="text-purple-100 text-sm">{musicData.core}</p>
          </div>
        </div>

        {musicData.url && (
          <div className="mb-4">
            <audio
              controls
              src={`/api/proxy?url=${encodeURIComponent(
                musicData.url
              )}&referer=${encodeURIComponent("https://qishui.douyin.com/")}&disposition=inline`}
              className="w-full"
              style={{
                filter:
                  "sepia(20%) saturate(70%) grayscale(1) contrast(99%) invert(12%)",
                borderRadius: "8px",
              }}>
              您的浏览器不支持音频播放
            </audio>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {musicData.url && (
            <a
              href={`/api/proxy?url=${encodeURIComponent(
                musicData.url
              )}&referer=${encodeURIComponent("https://qishui.douyin.com/")}&filename=${encodeURIComponent(musicData.name || "music")}&disposition=attachment`}
              download
              className="px-5 py-2.5 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-all font-medium text-sm shadow-md">
              下载音频
            </a>
          )}
          {musicData.url && (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(musicData.url);
                alert("已复制汽水音乐直链到剪贴板！");
              }}
              className="px-5 py-2.5 bg-purple-600/80 hover:bg-purple-600 text-white rounded-xl transition-all font-medium text-sm border border-purple-400/30">
              复制音频直链
            </button>
          )}
          {musicData.lyrics && (
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className="px-5 py-2.5 bg-purple-700/80 hover:bg-purple-700 text-white rounded-xl transition-all font-medium text-sm">
              {showLyrics ? "隐藏歌词" : "显示歌词"}
            </button>
          )}
        </div>
      </div>

      {showLyrics && musicData.lyrics && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            歌词
          </h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
            {musicData.lyrics}
          </pre>
        </div>
      )}

      {musicData.copyright && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 p-2 bg-gray-100 dark:bg-gray-700 rounded">
          {musicData.copyright}
        </div>
      )}
    </>
  );
}
