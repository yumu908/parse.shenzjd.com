const dns = require('dns');
try { dns.setDefaultResultOrder('ipv4first'); } catch {}

async function getTTWIDCookie() {
  try {
    console.log("Fetching ttwid cookie from ttwid.bytedance.com...");
    const res = await fetch("https://ttwid.bytedance.com/ttwid/union/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        region: "cn",
        aid: 1768,
        needFp: "true",
        fp: "verify_1234567890",
        service: "www.douyin.com",
        migrate_info: { ticket: "", src_aid: 0 },
        cbUrlProtocol: "https",
      }),
    });
    console.log("TTWID Register status:", res.status);
    const setCookie = res.headers.get("set-cookie");
    console.log("Set-Cookie:", setCookie);
    const json = await res.json();
    console.log("Register json:", json);
  } catch (e) {
    console.log("TTWID Register error:", e.message);
  }

  try {
    console.log("\nFetching ttwid by visiting www.douyin.com homepage...");
    const res2 = await fetch("https://www.douyin.com/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      redirect: "manual"
    });
    console.log("Douyin status:", res2.status);
    console.log("Douyin set-cookie headers:", res2.headers.getSetCookie?.() || res2.headers.get("set-cookie"));
  } catch (e) {
    console.log("Douyin homepage error:", e.message);
  }
}

getTTWIDCookie();
