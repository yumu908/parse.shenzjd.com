async function run() {
  const url = "https://isee.weishi.qq.com/ws/app-pages/share/index.html?wxplay=1&id=7R6CMpGYB1WQlwB82&spid=1786470174033647&qua=v2_iph_weishi_8.200.1_203_app_a&from_share=1&chid=100004006&pkg=3670&attach=cp_reserves3_1000060003";

  // Try HTTP and HTTPS with iPhone UA and Android UA and WeChat UA
  const uas = [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.38(0x1800262c) NetType/WIFI Language/zh_CN",
    "Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36 MicroMessenger/8.0.35.2360(0x28002351)",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  ];

  for (let i = 0; i < uas.length; i++) {
    console.log(`Testing UA #${i+1}`);
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": uas[i],
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "zh-CN,zh;q=0.9",
        },
        signal: AbortSignal.timeout(8000)
      });
      console.log("Status:", res.status);
      const html = await res.text();
      console.log("HTML len:", html.length);
      if (html.length > 0) {
        console.log("HTML head snippet:", html.slice(0, 400));
        const videoMatch = html.match(/"video_url"\s*:\s*"([^"]+)"/i) || html.match(/"url"\s*:\s*"([^"]+)"/i) || html.match(/(https?:[^\s"'<>]+?\.mp4[^\s"'<>]*)/i);
        console.log("Video match:", videoUrlMatch?.[1] || videoUrlMatch?.[0] || "NONE");
      }
    } catch (e) {
      console.log("Error:", e.message);
    }
  }
}

run();
