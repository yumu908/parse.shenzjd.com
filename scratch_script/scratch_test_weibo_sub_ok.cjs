const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

async function testWeiboSubOk(fid) {
  console.log("Testing Weibo with Visitor Cookie for fid:", fid);

  try {
    const postData = `data={\"Component_Play_Playinfo\":{\"oid\":\"${fid}\"}}`;
    const res = await fetch(`https://weibo.com/tv/api/component?page=/tv/show/${fid}`, {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15",
        "Referer": `https://weibo.com/tv/show/${fid}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": "SUB=_2A25I0...", // 测试 Cookie
      },
      body: postData,
      signal: AbortSignal.timeout(4000),
    });

    console.log("Status:", res.status);
    const json = await res.json();
    console.log("JSON:\n", JSON.stringify(json, null, 2).slice(0, 500));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

testWeiboSubOk("1034:5314173463363635");
