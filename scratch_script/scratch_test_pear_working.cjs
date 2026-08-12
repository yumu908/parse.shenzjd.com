const dns = require("dns");
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {}

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function parsePearVideoId(videoId) {
  console.log("Parsing PearVideo ID:", videoId);
  const mrd = Math.floor(Math.random() * 900000 + 100000);
  const reqUrl = `https://www.pearvideo.com/videoStatus.jsp?contId=${videoId}&mrd=0.${mrd}`;

  try {
    const res = await fetch(reqUrl, {
      headers: {
        "User-Agent": UA,
        "Referer": `https://www.pearvideo.com/video_${videoId}`,
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
      },
      signal: AbortSignal.timeout(6000),
    });

    console.log("API Status:", res.status);
    const json = await res.json();
    console.log("API JSON:\n", JSON.stringify(json, null, 2));

    const systemTime = json.systemTime;
    const srcUrl = json.videoInfo?.videos?.srcUrl;
    let videoUrl = "";
    if (srcUrl && systemTime) {
      videoUrl = srcUrl.replace(systemTime, `cont-${videoId}`);
    } else if (srcUrl) {
      videoUrl = srcUrl;
    }

    // 抓取页面获取 title 和 cover
    let title = "";
    let cover = json.videoInfo?.video_image || "";
    try {
      const htmlRes = await fetch(`https://www.pearvideo.com/video_${videoId}`, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(6000),
      });
      if (htmlRes.ok) {
        const html = await htmlRes.text();
        const titleMatch =
          html.match(/<h1 class="video-tt">(.*?)<\/h1>/s) ||
          html.match(/<title>(.*?)<\/title>/i);
        if (titleMatch?.[1]) {
          title = titleMatch[1].replace(/_梨视频.*/, "").replace(/<[^>]+>/g, "").trim();
        }
        if (!cover) {
          const coverMatch = html.match(/poster="([^"]+)"/i) || html.match(/src="([^"]+?\.jpg)"/i);
          if (coverMatch?.[1]) cover = coverMatch[1];
        }
      }
    } catch (e) {
      console.log("HTML fetch notice:", e.message);
    }

    return {
      code: 200,
      msg: "解析成功",
      data: {
        title: title || `梨视频 ${videoId}`,
        author: "梨视频",
        avatar: "",
        cover: cover,
        url: videoUrl,
      },
    };
  } catch (e) {
    return { code: 500, msg: "解析失败: " + e.message };
  }
}

async function main() {
  const r1 = await parsePearVideoId("1807012");
  console.log("Result 1807012:\n", JSON.stringify(r1, null, 2));

  const r2 = await parsePearVideoId("1806992");
  console.log("Result 1806992:\n", JSON.stringify(r2, null, 2));
}

main();
