const http = require("http");
const https = require("https");
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const USER_COOKIE = 'SINAGLOBAL=4779333765649.163.1786358225525; SCF=ArA-3xiwsqrx-Gpx7vr7HtfseeB1BP7A1rU_2SOV6Osq0P1Y2bCBBCIsHTzBX4kV3B2Iy0s4pm-M4dBTleog5_M.; SUB=_2A25HfzzlDeRhGe9P61cU8CbOwz2IHXVk9TAtrDV8PUNbmtAbLRn3kW9Nd5AoYh5f4jabrwhpsuU7pQ02WyQJdsWd; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WhvOTupPdionRPGMc_NK8GO5JpX5KzhUgL.Fo.peh-fehnE1h22dJLoIE2LxKnLBKMLBKeLxK.L1KBL12zLxK.L1K-L1-BEehzcehnt; ALF=02_1789057461; _s_tentry=-; Apache=6806496044272.552.1786513388548; ULV=1786513388603:3:3:3:6806496044272.552.1786513388548:1786464627478; XSRF-TOKEN=B6xfaLfUPdx9chWEZAqi94V6; WBPSESS=aecFunz97mgXkLMueb4rkBZMcmIPLuN-BtYe-K5GiJhOXRLAxqQemEMKFNXAUuOoD1ykrrgWw1a5sSSiBFcXcuCKzE-V3lPcwwrypMuk9vG-34xmCg46xZ4xlJzjGgmlnqSnTKWdLqqzcNL7bkMdhg==';

function testProxyConnect(fid) {
  return new Promise((resolve, reject) => {
    const postData = `data={\"Component_Play_Playinfo\":{\"oid\":\"${fid}\"}}`;
    
    // 连接 127.0.0.1:28789 代理服务器 CONNECT weibo.com:443
    const req = http.request({
      hostname: "127.0.0.1",
      port: 28789,
      method: "CONNECT",
      path: "weibo.com:443",
    });

    req.on("connect", (res, socket, head) => {
      console.log("CONNECT to Proxy 28789 Success!");
      const tls = require("tls");
      const tlsSocket = tls.connect({
        host: "weibo.com",
        socket: socket,
        servername: "weibo.com",
      }, () => {
        console.log("TLS handshake via Proxy success!");
        const postHeaders = [
          `POST /tv/api/component?page=/tv/show/${fid} HTTP/1.1`,
          `Host: weibo.com`,
          `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36`,
          `Referer: https://weibo.com/tv/show/${fid}`,
          `Content-Type: application/x-www-form-urlencoded`,
          `Cookie: ${USER_COOKIE}`,
          `Content-Length: ${Buffer.byteLength(postData)}`,
          `Connection: close`,
          ``,
          postData,
        ].join("\r\n");

        tlsSocket.write(postHeaders);
      });

      let data = "";
      tlsSocket.on("data", c => data += c.toString());
      tlsSocket.on("end", () => resolve(data));
      tlsSocket.on("error", reject);
    });

    req.on("error", reject);
    req.end();
  });
}

async function main() {
  console.log("Testing CONNECT tunneling via local proxy 127.0.0.1:28789 ...");
  try {
    const raw = await testProxyConnect("1034:5326514065965150");
    console.log("Raw response len:", raw.length);
    console.log("Raw response snippet:\n", raw.slice(0, 1000));
    if (raw.includes("http")) {
      console.log("VICTORY VIA PROXY TUNNEL!");
    }
  } catch (e) {
    console.error("Proxy Connect Error:", e.message);
  }
}

main();
