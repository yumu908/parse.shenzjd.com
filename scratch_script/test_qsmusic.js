import https from "https";
import http from "http";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, {
      headers: { "User-Agent": UA }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on("error", reject);
  });
}

async function testQishui() {
  const url = "https://qishui.douyin.com/s/iXJXkjCg/";
  console.log("请求 汽水音乐:", url);
  const r1 = await httpGet(url);
  console.log("Status:", r1.status);
  console.log("Location:", r1.headers.location);

  const redirectUrl = r1.headers.location || url;
  const match = redirectUrl.match(/track_id=(\d+)/) || redirectUrl.match(/track\/(\d+)/);
  console.log("Redirect URL:", redirectUrl);
  console.log("Track ID Match:", match?.[1]);

  let trackId = match?.[1];

  // 如果短链没包含 track_id，请求 HTML 查看内容
  if (!trackId && r1.body) {
    const m = r1.body.match(/track_id=(\d+)/) || r1.body.match(/track_id":"(\d+)"/) || r1.body.match(/track\/(\d+)/);
    console.log("HTML match trackId:", m?.[1]);
    if (m?.[1]) trackId = m[1];
  }

  if (trackId) {
    const apiUrl = `https://music.douyin.com/qishui/share/track?track_id=${trackId}`;
    console.log("请求 详情页 API:", apiUrl);
    const r2 = await httpGet(apiUrl);
    console.log("API Status:", r2.status, "HTML len:", r2.body.length);
    const jsJsonMatch = r2.body.match(/_ROUTER_DATA\s*=\s*({[\s\S]*?});/);
    console.log("ROUTER_DATA 匹配到:", !!jsJsonMatch);
    if (jsJsonMatch?.[1]) {
      const data = JSON.parse(jsJsonMatch[1].trim());
      console.log("Track Data Keys:", Object.keys(data.loaderData || {}));
      const audioUrl = data.loaderData?.track_page?.audioWithLyricsOption?.url || data.loaderData?.track_page?.track?.audio_url;
      console.log("Audio URL:", audioUrl);
    }
  }
}

testQishui();
