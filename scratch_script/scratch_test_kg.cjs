const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

async function test() {
  const videoId = "vAIyiYvegf9yzv00";
  const cgiUrls = [
    `https://node.kg.qq.com/cgi/fcgi-bin/fcg_get_play_url?shareid=${videoId}`,
    `https://cgi.kg.qq.com/fcgi-bin/fcg_get_play_url?shareid=${videoId}`,
    `https://kg.qq.com/cgi/fcgi-bin/fcg_get_play_url?shareid=${videoId}`
  ];

  for (const url of cgiUrls) {
    try {
      console.log("Fetching CGI:", url);
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://kg.qq.com/"
        }
      });
      console.log("Status:", res.status);
      const text = await res.text();
      console.log("Response text:", text.slice(0, 500));
    } catch (e) {
      console.log("CGI error:", e.message);
    }
  }
}

test();
