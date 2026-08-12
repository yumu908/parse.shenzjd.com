import dns from "dns";
import https from "https";
import http from "http";

dns.setDefaultResultOrder("ipv4first");

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

function httpGet(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, {
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9",
        ...options.headers,
      },
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on("error", reject);
  });
}

function httpPost(url, payload, options = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const postData = JSON.stringify(payload);
    const req = https.request(u, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
        "User-Agent": UA,
        "Origin": `${u.protocol}//${u.host}`,
        "Referer": `${u.protocol}//${u.host}/`,
        ...options.headers,
      },
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log("=== 1. 测试皮皮虾短链重定向 ===");
  try {
    const r1 = await httpGet("https://h5.pipix.com/s/n3i1QdH1bGU/");
    console.log("皮皮虾 status:", r1.status);
    console.log("皮皮虾 location:", r1.headers.location);

    const targetUrl = r1.headers.location || "https://h5.pipix.com/s/n3i1QdH1bGU/";
    const idMatch = targetUrl.match(/\/item\/(\d+)/) || targetUrl.match(/\/cell\/(\d+)/) || targetUrl.match(/\/([0-9]{15,20})/);
    console.log("皮皮虾 提取 ID:", idMatch?.[1]);

    if (idMatch?.[1]) {
      const apiRes = await httpGet(`https://h5.pipix.com/bds/web/cell/detail/?cell_id=${idMatch[1]}&cell_type=1`);
      console.log("皮皮虾 API status:", apiRes.status);
      const json = JSON.parse(apiRes.body);
      const item = json?.data?.item || json?.data?.cell?.item;
      console.log("皮皮虾 视频地址:", item?.video?.video_high?.url_list?.[0]?.url || item?.video?.video_download?.url_list?.[0]?.url);
    }
  } catch (e) {
    console.error("皮皮虾 异常:", e.message);
  }

  console.log("\n=== 2. 测试皮皮搞笑 ===");
  const ppxUrl = "https://h5.ippzone.com/spacey/post/894797262287?zy_to=copy_link&share_count=1&m=35c265f0dfd5b5b7f3488c556f8321cd&app=&type=post&did=677ad691216c45d8764ed57c0a5f44c8&mid=8703264874476&pid=894797262287";
  const pidMatch = ppxUrl.match(/pid=(\d+)/);
  const midMatch = ppxUrl.match(/mid=(\d+)/);
  try {
    const r2 = await httpPost("https://h5.ippzone.com/ppapi/share/fetch_content", {
      pid: parseInt(pidMatch[1]),
      mid: parseInt(midMatch[1]),
      type: "post",
    });
    console.log("皮皮搞笑 status:", r2.status);
    const json = JSON.parse(r2.body);
    const post = json?.data?.post;
    console.log("皮皮搞笑 帖子内容:", post?.content);
    let videoUrl = null;
    if (post?.videos) {
      const list = Array.isArray(post.videos) ? post.videos : Object.values(post.videos);
      for (const item of list) {
        if (!item) continue;
        const v = Array.isArray(item) ? item[0] : item;
        if (v?.url) { videoUrl = v.url; break; }
      }
    }
    console.log("皮皮搞笑 视频地址:", videoUrl);
  } catch (e) {
    console.error("皮皮搞笑 异常:", e.message);
  }
}

main();
