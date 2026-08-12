const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function parseWeiboVideo(fid) {
  console.log("Parsing Weibo video fid:", fid);

  // 清理 fid，只保留 1034:xxx 格式
  const cleanId = fid.split("&")[0].split("?")[0];
  console.log("Clean ID:", cleanId);

  // 1. 发起 weibo.com/tv/api/component POST 请求
  const postData = `data={\"Component_Play_Playinfo\":{\"oid\":\"${cleanId}\"}}`;
  try {
    const res = await fetch(`https://weibo.com/tv/api/component?page=/tv/show/${cleanId}`, {
      method: "POST",
      headers: {
        "User-Agent": UA,
        "Referer": `https://weibo.com/tv/show/${cleanId}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json, text/plain, */*",
      },
      body: postData,
      signal: AbortSignal.timeout(6000),
    });

    console.log("POST Status:", res.status);
    const json = await res.json();
    console.log("POST JSON:\n", JSON.stringify(json, null, 2).slice(0, 1000));

    const playInfo = json?.data?.Component_Play_Playinfo;
    if (playInfo?.urls) {
      const videoUrl = Object.values(playInfo.urls)[0];
      if (videoUrl) {
        console.log("SUCCESS via POST! Video URL:", videoUrl);
        return {
          title: playInfo.title || "",
          author: playInfo.author || "",
          cover: playInfo.cover_image || "",
          url: videoUrl,
        };
      }
    }
  } catch (e) {
    console.error("POST fetch error:", e.message);
  }

  // 2. 备用尝试: m.weibo.cn 详情页
  try {
    const res = await fetch(`https://m.weibo.cn/s/video/show?object_id=${cleanId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15",
        "Referer": `https://m.weibo.cn/s/video/show?object_id=${cleanId}`,
      },
      signal: AbortSignal.timeout(6000),
    });

    console.log("Mobile API Status:", res.status);
    const json = await res.json();
    const obj = json?.data?.object;
    const streamUrl = obj?.stream?.hd_url || obj?.stream?.url;
    if (streamUrl) {
      console.log("SUCCESS via Mobile API! Stream URL:", streamUrl);
      return {
        title: obj.summary || "",
        author: obj.author?.screen_name || "",
        cover: obj.page_pic?.url || "",
        url: streamUrl,
      };
    }
  } catch (e) {
    console.error("Mobile API fetch error:", e.message);
  }

  return null;
}

async function main() {
  await parseWeiboVideo("1034:5314173463363635");
  await parseWeiboVideo("1034:5325328441081920");
}

main();
