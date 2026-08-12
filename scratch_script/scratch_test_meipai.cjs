const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

async function test() {
  const urls = [
    "https://www.meipai.com/media/6732977725291394063",
    "https://m.meipai.com/media/6732977725291394063",
    "https://www.meipai.com/video/769/6732977725291394063"
  ];
  for (const url of urls) {
    try {
      console.log("Fetching:", url);
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
          "Referer": "https://www.meipai.com/"
        },
        redirect: "follow"
      });
      console.log("Status:", resp.status, "URL:", resp.url);
      const html = await resp.text();
      console.log("HTML length:", html.length);

      const dataVideo = html.match(/data-video="([^"]+)"/);
      console.log("data-video:", dataVideo?.[1]);

      const mp4s = html.match(/https?:\/\/[^"'\s\\]+\.mp4[^"'\s\\]*/gi) || [];
      console.log("mp4s:", mp4s.slice(0, 5));
    } catch (err) {
      console.log("Error:", err.message);
    }
  }
}

test();
