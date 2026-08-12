const https = require("https");
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const USER_COOKIE = 'SINAGLOBAL=4779333765649.163.1786358225525; SCF=ArA-3xiwsqrx-Gpx7vr7HtfseeB1BP7A1rU_2SOV6Osq0P1Y2bCBBCIsHTzBX4kV3B2Iy0s4pm-M4dBTleog5_M.; SUB=_2A25HfzzlDeRhGe9P61cU8CbOwz2IHXVk9TAtrDV8PUNbmtAbLRn3kW9Nd5AoYh5f4jabrwhpsuU7pQ02WyQJdsWd; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WhvOTupPdionRPGMc_NK8GO5JpX5KzhUgL.Fo.peh-fehnE1h22dJLoIE2LxKnLBKMLBKeLxK.L1KBL12zLxK.L1K-L1-BEehzcehnt; ALF=02_1789057461; _s_tentry=-; Apache=6806496044272.552.1786513388548; ULV=1786513388603:3:3:3:6806496044272.552.1786513388548:1786464627478; XSRF-TOKEN=B6xfaLfUPdx9chWEZAqi94V6; WBPSESS=aecFunz97mgXkLMueb4rkBZMcmIPLuN-BtYe-K5GiJhOXRLAxqQemEMKFNXAUuOoD1ykrrgWw1a5sSSiBFcXcuCKzE-V3lPcwwrypMuk9vG-34xmCg46xZ4xlJzjGgmlnqSnTKWdLqqzcNL7bkMdhg==';

function fetchWeiboNative(path, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "m.weibo.cn",
      port: 443,
      path: path,
      method: method,
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15",
        "Referer": "https://m.weibo.cn/",
        "Cookie": USER_COOKIE,
        "Accept": "application/json, text/plain, */*",
      },
      family: 4,
      timeout: 5000,
    };

    if (body) {
      options.headers["Content-Type"] = "application/x-www-form-urlencoded";
      options.headers["Content-Length"] = Buffer.byteLength(body);
    }

    const req = https.request(options, (res) => {
      console.log("HTTPS Status:", res.statusCode);
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => resolve({ status: res.statusCode, data }));
    });

    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  console.log("Testing native https request to m.weibo.cn with family: 4...");
  try {
    const res = await fetchWeiboNative("/statuses/show?id=5326514410233933");
    console.log("Response status:", res.status);
    console.log("Response len:", res.data.length);
    const json = JSON.parse(res.data);
    console.log("JSON ok:", json.ok);
    const media = json?.data?.page_info?.media_info || json?.data?.status?.page_info?.media_info;
    const stream = media?.stream_url_hd || media?.stream_url || media?.mp4_hd_url;
    if (stream) {
      console.log("VICTORY! Stream URL found:\n", stream);
    } else {
      console.log("JSON content:\n", JSON.stringify(json, null, 2).slice(0, 1000));
    }
  } catch (e) {
    console.error("Native HTTPS Error:", e.message);
  }
}

main();
