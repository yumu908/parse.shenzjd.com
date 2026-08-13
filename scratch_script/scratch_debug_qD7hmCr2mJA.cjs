const dns = require('dns');
try { dns.setDefaultResultOrder('ipv4first'); } catch {}

const DOUYIN_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
  "sec-fetch-site": "same-origin",
  "sec-fetch-mode": "cors",
  "sec-fetch-dest": "empty",
  "sec-ch-ua-platform": "Windows",
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
  referer: "https://www.douyin.com/?recommend=1",
  priority: "u=1, i",
  pragma: "no-cache",
  "cache-control": "no-cache",
  "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  dnt: "1",
};

async function debugDouyinVideo() {
  const redirectUrl = "https://www.iesdouyin.com/share/video/7665346525232688101/?region=US&mid=7534590257447193395&u_code=0&did=MS4wLjABAAAAL17KZFA8gBxHWHAlMVmHOitPSIVM0YBXHr18PRgaQN-OojypxtP3KcFFx90ALXme&iid=MS4wLjABAAAANwkJuWIRFOzg5uCpDRpMj4OX-QryoDgn-yYlXQnRwQQ&with_sec_did=1&video_share_track_ver=&titleType=title&share_sign=H19BHmmFPHv5TQtEsvQI.KjkBrqJRD_xg8Qok1Ioq9Q-&share_version=170400&ts=1786558721&from_aid=6383&from_ssr=1&share_track_info=%7B%22link_description_type%22%3A%22%22%7D&from=web_code_link";
  console.log("Fetching redirectUrl:", redirectUrl);

  const res = await fetch(redirectUrl, {
    headers: DOUYIN_HEADERS
  });
  console.log("Status:", res.status);
  const html = await res.text();
  console.log("HTML length:", html.length);
  console.log("HTML snippet (first 1000 chars):\n", html.substring(0, 1000));

  // Check if routerData is present
  const routerMatch = html.match(/_ROUTER_DATA\s*=\s*(.*?)<\/script>/s);
  console.log("Router match exists?", !!routerMatch);
  if (routerMatch) {
    console.log("Router data snippet:", routerMatch[1].substring(0, 500));
  }

  // Check _RENDER_DATA
  const renderMatch = html.match(/_RENDER_DATA\s*=\s*(.*?)<\/script>/s);
  console.log("Render match exists?", !!renderMatch);
  if (renderMatch) {
    console.log("Render data snippet:", renderMatch[1].substring(0, 500));
  }

  // Check play_addr regex
  const playAddrMatch = html.match(/"play_addr":\s*\{\s*"url_list":\s*\[\s*"([^"]+)"/);
  console.log("play_addr match exists?", !!playAddrMatch);

  // Check all script tags or window.__APOLLO_STATE__
  const apolloMatch = html.match(/__APOLLO_STATE__\s*=\s*(.*?)<\/script>/s);
  console.log("Apollo match exists?", !!apolloMatch);
}

debugDouyinVideo();
