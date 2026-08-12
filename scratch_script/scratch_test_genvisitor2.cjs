const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

/**
 * 动态获取微博访客 SUB Cookie
 */
async function fetchWeiboVisitorSub() {
  try {
    const res = await fetch("https://passport.weibo.com/visitor/genvisitor2", {
      method: "POST",
      headers: {
        "User-Agent": UA,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "cb=gen_callback&fp=%7B%22os%22%3A%222%22%2C%22browser%22%3A%22Chrome122.0.0.0%22%2C%22platform%22%3A%22Win32%22%2C%22public_key%22%3A%22MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDDBc3e%22%7D",
      signal: AbortSignal.timeout(4000),
    });

    const text = await res.text();
    console.log("genvisitor2 raw text:", text.slice(0, 500));

    const match = text.match(/"sub"\s*:\s*"([^"]+)"/i) || text.match(/"subp"\s*:\s*"([^"]+)"/i);
    const subMatch = text.match(/"sub"\s*:\s*"([^"]+)"/i);
    const subpMatch = text.match(/"subp"\s*:\s*"([^"]+)"/i);

    if (subMatch?.[1]) {
      const cookieStr = `SUB=${subMatch[1]}; ${subpMatch ? `SUBP=${subpMatch[1]};` : ""}`;
      console.log("SUCCESS! Dynamic Visitor Cookie:", cookieStr);
      return cookieStr;
    }
  } catch (e) {
    console.error("Genvisitor error:", e.message);
  }
  return "";
}

async function testWeiboWithDynamicSub(fid) {
  console.log("\n=================================");
  console.log("Testing Weibo fid:", fid);

  const subCookie = await fetchWeiboVisitorSub();
  console.log("Using Sub Cookie:", subCookie);

  const postData = `data={\"Component_Play_Playinfo\":{\"oid\":\"${fid}\"}}`;
  try {
    const res = await fetch(`https://weibo.com/tv/api/component?page=/tv/show/${fid}`, {
      method: "POST",
      headers: {
        "User-Agent": UA,
        "Referer": `https://weibo.com/tv/show/${fid}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": subCookie || "SUB=_2A25xxxx;",
      },
      body: postData,
      signal: AbortSignal.timeout(6000),
    });

    console.log("POST status:", res.status);
    const json = await res.json();
    console.log("POST JSON snippet:\n", JSON.stringify(json, null, 2).slice(0, 1000));

    const playInfo = json?.data?.Component_Play_Playinfo;
    if (playInfo?.urls) {
      const videoUrl = Object.values(playInfo.urls)[0];
      console.log("SUCCESS! Extracted Video URL:", videoUrl);
    }
  } catch (e) {
    console.error("POST fetch error:", e.message);
  }
}

async function main() {
  await testWeiboWithDynamicSub("1034:5326514065965150");
  await testWeiboWithDynamicSub("1034:5314173463363635");
}

main();
