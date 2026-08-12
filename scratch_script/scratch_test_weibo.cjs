const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function testWeibo(fid) {
  console.log("\n=========================");
  console.log("Testing Weibo fid:", fid);

  // 尝试 1: m.weibo.cn status API / detail API
  const urls = [
    `https://m.weibo.cn/statuses/show?id=${fid}`,
    `https://m.weibo.cn/s/video/show?object_id=${fid}`,
    `https://weibo.com/ajax/statuses/show?id=${fid}`,
    `https://h5.video.weibo.com/api/component?page=/tv/show/${fid}`,
  ];

  for (const url of urls) {
    console.log("\nFetching URL:", url);
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": UA,
          "Referer": `https://h5.video.weibo.com/show/m/${fid}`,
        },
        signal: AbortSignal.timeout(6000),
      });

      console.log("Status:", res.status);
      const text = await res.text();
      console.log("Text len:", text.length);

      try {
        const json = JSON.parse(text);
        console.log("JSON snippet:\n", JSON.stringify(json, null, 2).slice(0, 800));
      } catch {
        console.log("HTML snippet:", text.slice(0, 300));
      }
    } catch (e) {
      console.error("Fetch Error:", e.message);
    }
  }

  // 尝试 2: POST to https://weibo.com/tv/api/component
  console.log("\nFetching POST https://weibo.com/tv/api/component:");
  try {
    const postData = `data={\"Component_Play_Playinfo\":{\"oid\":\"${fid}\"}}`;
    const res = await fetch(`https://weibo.com/tv/api/component?page=/tv/show/${fid}`, {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Referer": `https://weibo.com/tv/show/${fid}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: postData,
      signal: AbortSignal.timeout(6000),
    });
    console.log("POST Status:", res.status);
    const json = await res.json();
    console.log("POST JSON snippet:\n", JSON.stringify(json, null, 2).slice(0, 800));
  } catch (e) {
    console.error("POST Error:", e.message);
  }

  // 尝试 3: 直接抓取 H5 网页 https://h5.video.weibo.com/show/m/${fid}
  console.log("\nFetching H5 HTML https://h5.video.weibo.com/show/m/" + fid);
  try {
    const res = await fetch(`https://h5.video.weibo.com/show/m/${fid}`, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(6000),
    });
    console.log("H5 HTML status:", res.status);
    const html = await res.text();
    console.log("H5 HTML len:", html.length);

    const mp4Match = html.match(/https?:[^\s"'<>]+?\.mp4[^\s"'<>]*/i) || html.match(/"stream_url"\s*:\s*"([^"]+)"/i);
    console.log("MP4 found in H5 HTML:", mp4Match?.[1] || mp4Match?.[0]);
  } catch (e) {
    console.error("H5 HTML Error:", e.message);
  }
}

async function main() {
  await testWeibo("1034:5314173463363635");
  await testWeibo("1034:5325328441081920");
}

main();
