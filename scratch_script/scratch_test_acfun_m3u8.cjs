const fs = require('fs');

async function test() {
  const m3u8Url = "https://tx-safety-video.acfun.cn/mediacloud/acfun/acfun_video/c3f97ee5bf97a146-69db609aeb47adaf66882172508bf36c-hls_4k_h264_1.m3u8?pkey=ABBwTqZiub-s6S6WaavhOlqTh6AHnc7tlRbmvNOkst5Wo-ywx9ugOj3OTwqw7ZuggJUGJGGWWGEpEfD6CFdOHpnu2J2yQDyj3O4iFNVjJ2Caqq1eo3xVHJ2EDY4Lb6oOAyHBRnTmM3He3kA_HYTjqAni0g-KLqHR06uMRwoBKL4Q9EkLrepTyASmWYcy5E71i6Za7ivJr43Xo7Pv6cVw2JVIBGGkLwIfy5Daf2VQl5K-8g&safety_id=AAL1GPxYEwaqV1MpbjpQvJJs";
  
  console.log("Fetching m3u8...");
  const res = await fetch(m3u8Url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Referer": "https://www.acfun.cn/"
    }
  });

  const text = await res.text();
  console.log("M3U8 Content:\n", text);

  const baseUrl = new URL(m3u8Url);
  const rewritten = text.replace(/^(?!#)([^\r\n]+)/gm, (line) => {
    const trimmed = line.trim();
    if (!trimmed) return line;
    try {
      const seg = new URL(trimmed, baseUrl).toString();
      return `/api/proxy?url=${encodeURIComponent(seg)}&referer=${encodeURIComponent('https://www.acfun.cn/')}`;
    } catch {
      return line;
    }
  });

  console.log("Rewritten M3U8 Content:\n", rewritten);
}

test();
