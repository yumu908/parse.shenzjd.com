const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function testWeibo2(fid) {
  console.log("\n=========================");
  console.log("Testing Weibo fid:", fid);

  // 1. 测试 m.weibo.cn/s/video/show?object_id=
  const url1 = `https://m.weibo.cn/s/video/show?object_id=${fid}`;
  console.log("Fetching API 1:", url1);
  try {
    const res = await fetch(url1, {
      headers: {
        "User-Agent": UA,
        "Referer": `https://m.weibo.cn/s/video/show?object_id=${fid}`,
        "MWeibo-Pwa": "1",
        "X-Requested-With": "XMLHttpRequest",
      },
      signal: AbortSignal.timeout(5000),
    });

    console.log("Status 1:", res.status);
    const json = await res.json();
    console.log("API 1 json data:\n", JSON.stringify(json, null, 2).slice(0, 1000));
    const stream = json?.data?.object?.stream?.hd_url || json?.data?.object?.stream?.url;
    if (stream) {
      console.log("SUCCESS! Stream URL:", stream);
    }
  } catch (e) {
    console.error("API 1 Error:", e.message);
  }

  // 2. 测试 m.weibo.cn/s/video/object?object_id=
  const url2 = `https://m.weibo.cn/s/video/object?object_id=${fid}`;
  console.log("\nFetching API 2:", url2);
  try {
    const res = await fetch(url2, {
      headers: {
        "User-Agent": UA,
        "Referer": `https://m.weibo.cn/s/video/show?object_id=${fid}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    console.log("Status 2:", res.status);
    const json = await res.json();
    console.log("API 2 json data:\n", JSON.stringify(json, null, 2).slice(0, 1000));
    const stream = json?.data?.object?.stream?.hd_url || json?.data?.object?.stream?.url;
    if (stream) {
      console.log("SUCCESS! Stream URL:", stream);
    }
  } catch (e) {
    console.error("API 2 Error:", e.message);
  }
}

async function main() {
  await testWeibo2("1034:5314173463363635");
  await testWeibo2("1034:5325328441081920");
}

main();
