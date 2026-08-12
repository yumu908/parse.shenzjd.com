const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

console.log("System Proxy envs:");
console.log("http_proxy:", process.env.http_proxy || process.env.HTTP_PROXY);
console.log("https_proxy:", process.env.https_proxy || process.env.HTTPS_PROXY);

const USER_COOKIE = 'SINAGLOBAL=4779333765649.163.1786358225525; SCF=ArA-3xiwsqrx-Gpx7vr7HtfseeB1BP7A1rU_2SOV6Osq0P1Y2bCBBCIsHTzBX4kV3B2Iy0s4pm-M4dBTleog5_M.; SUB=_2A25HfzzlDeRhGe9P61cU8CbOwz2IHXVk9TAtrDV8PUNbmtAbLRn3kW9Nd5AoYh5f4jabrwhpsuU7pQ02WyQJdsWd; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WhvOTupPdionRPGMc_NK8GO5JpX5KzhUgL.Fo.peh-fehnE1h22dJLoIE2LxKnLBKMLBKeLxK.L1KBL12zLxK.L1K-L1-BEehzcehnt; ALF=02_1789057461; _s_tentry=-; Apache=6806496044272.552.1786513388548; ULV=1786513388603:3:3:3:6806496044272.552.1786513388548:1786464627478; XSRF-TOKEN=B6xfaLfUPdx9chWEZAqi94V6; WBPSESS=aecFunz97mgXkLMueb4rkBZMcmIPLuN-BtYe-K5GiJhOXRLAxqQemEMKFNXAUuOoD1ykrrgWw1a5sSSiBFcXcuCKzE-V3lPcwwrypMuk9vG-34xmCg46xZ4xlJzjGgmlnqSnTKWdLqqzcNL7bkMdhg==';

async function testWeiboFetchWithCookie() {
  const fid = "1034:5326514065965150";
  const postData = `data={\"Component_Play_Playinfo\":{\"oid\":\"${fid}\"}}`;

  try {
    const res = await fetch(`https://weibo.com/tv/api/component?page=/tv/show/${fid}`, {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Referer": `https://weibo.com/tv/show/${fid}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": USER_COOKIE,
      },
      body: postData,
      signal: AbortSignal.timeout(5000),
    });

    console.log("Status:", res.status);
    const json = await res.json();
    console.log("JSON:\n", JSON.stringify(json, null, 2).slice(0, 1000));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

testWeiboFetchWithCookie();
