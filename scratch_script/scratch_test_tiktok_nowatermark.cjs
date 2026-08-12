const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

async function testApiFeed() {
  const videoId = "7107775747683912986";
  const apiUrls = [
    `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${videoId}`,
    `https://api22-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${videoId}`
  ];

  for (const url of apiUrls) {
    try {
      console.log("Fetching API Feed:", url);
      const res = await fetch(url, {
        headers: {
          "User-Agent": "TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet"
        }
      });
      console.log("Status:", res.status);
      const json = await res.json();
      const item = json?.aweme_list?.[0];
      if (item) {
        console.log("Found item in API Feed!");
        console.log("Desc:", item.desc);
        console.log("Author:", item.author?.nickname);
        console.log("Play Addr URL List:", item.video?.play_addr?.url_list);
        console.log("Download Addr URL List:", item.video?.download_addr?.url_list);
      }
    } catch (e) {
      console.log("API Feed error:", e.message);
    }
  }
}

testApiFeed();
