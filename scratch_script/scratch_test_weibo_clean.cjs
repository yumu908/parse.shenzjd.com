const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function parseWeiboId(shareUrl) {
  let id = "";
  const fidMatch = shareUrl.match(/fid=([0-9a-zA-Z:]+)/i) || shareUrl.match(/(1034:[0-9]+)/i) || shareUrl.match(/\/([0-9]{10,})/);

  if (fidMatch) {
    id = fidMatch[1];
  }

  if (!id) {
    return { code: 400, msg: "无法从微博链接提取视频 ID" };
  }

  console.log("Extracted Weibo Video ID:", id);

  // 1. 尝试 weibo.com/tv/api/component
  try {
    const postData = `data={\"Component_Play_Playinfo\":{\"oid\":\"${id}\"}}`;
    const res = await fetch(`https://weibo.com/tv/api/component?page=/tv/show/${id}`, {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": `https://weibo.com/tv/show/${id}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: postData,
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const json = await res.json();
      const playInfo = json?.data?.Component_Play_Playinfo;
      if (playInfo?.urls) {
        const videoUrl = Object.values(playInfo.urls)[0];
        if (videoUrl) {
          return {
            code: 200,
            msg: "解析成功",
            data: {
              title: playInfo.title || "微博视频",
              author: playInfo.author || "",
              avatar: playInfo.avatar || "",
              cover: playInfo.cover_image || "",
              url: videoUrl,
            },
          };
        }
      }
    }
  } catch (e) {
    console.log("POST API notice:", e.message);
  }

  // 2. 尝试 m.weibo.cn/s/video/show
  try {
    const res = await fetch(`https://m.weibo.cn/s/video/show?object_id=${id}`, {
      headers: {
        "User-Agent": UA,
        "Referer": `https://m.weibo.cn/s/video/show?object_id=${id}`,
      },
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const json = await res.json();
      const obj = json?.data?.object;
      const videoUrl = obj?.stream?.hd_url || obj?.stream?.url;
      if (videoUrl) {
        return {
          code: 200,
          msg: "解析成功",
          data: {
            title: obj.summary || "微博视频",
            author: obj.author?.screen_name || "",
            avatar: obj.author?.profile_image_url || "",
            cover: obj.page_pic?.url || "",
            url: videoUrl,
          },
        };
      }
    }
  } catch (e) {
    console.log("Mobile API notice:", e.message);
  }

  return { code: 404, msg: "未找到微博视频播放地址" };
}

async function main() {
  const r1 = await parseWeiboId("https://video.weibo.com/show?fid=1034:5314173463363635");
  console.log("Result 1:\n", JSON.stringify(r1, null, 2));

  const r2 = await parseWeiboId("https://video.weibo.com/show?fid=1034:5325328441081920");
  console.log("Result 2:\n", JSON.stringify(r2, null, 2));
}

main();
