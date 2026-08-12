const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

async function testWeiboFix(fid) {
  console.log("\n==================================");
  console.log("Testing Weibo fid:", fid);

  // 1. 尝试使用微博无感 Guest 游客接口获取 visitor sub凭证
  let subCookie = "";
  try {
    const vRes = await fetch("https://passport.weibo.com/visitor/genvisitor", {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "cb=gen_callback&fp=%7B%22os%22%3A%222%22%2C%22browser%22%3A%22Chrome122.0.0.0%22%2C%22platform%22%3A%22Win32%22%2C%22public_key%22%3A%22MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDDBc3e%22%7D",
      signal: AbortSignal.timeout(3000),
    });
    const setCookie = vRes.headers.get("set-cookie");
    if (setCookie) {
      subCookie = setCookie;
      console.log("Got Visitor Cookie:", subCookie);
    }
  } catch (e) {
    console.log("Genvisitor err:", e.message);
  }

  // 2. 尝试使用 https://h5.video.weibo.com/api/component
  try {
    const postData = `data={\"Component_Play_Playinfo\":{\"oid\":\"${fid}\"}}`;
    const res = await fetch(`https://h5.video.weibo.com/api/component?page=/tv/show/${fid}`, {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15",
        "Referer": `https://h5.video.weibo.com/show/m/${fid}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": subCookie,
      },
      body: postData,
      signal: AbortSignal.timeout(4000),
    });

    console.log("h5.video.weibo.com Status:", res.status);
    const json = await res.json();
    console.log("h5 API JSON:\n", JSON.stringify(json, null, 2).slice(0, 800));
  } catch (e) {
    console.log("h5 API err:", e.message);
  }

  // 3. 尝试请求 https://weibo.com/ajax/statuses/show?id=... (通过 object_id 换取 mid)
  const shortId = fid.replace("1034:", "");
  console.log("Testing shortId:", shortId);

  try {
    const res = await fetch(`https://m.weibo.cn/statuses/show?id=${shortId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15",
        "Referer": "https://m.weibo.cn/",
      },
      signal: AbortSignal.timeout(4000),
    });

    console.log("m.weibo.cn statuses/show status:", res.status);
    const json = await res.json();
    console.log("statuses/show JSON:\n", JSON.stringify(json, null, 2).slice(0, 800));
    const stream = json?.data?.page_info?.media_info?.stream_url;
    if (stream) console.log("FOUND STREAM:", stream);
  } catch (e) {
    console.log("m.weibo.cn statuses err:", e.message);
  }
}

async function main() {
  await testWeiboFix("1034:5314173463363635");
  await testWeiboFix("1034:5325328441081920");
}

main();
