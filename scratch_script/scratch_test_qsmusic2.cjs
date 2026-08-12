const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function testQishuiAlt() {
  const code = "iXJXkjCg";
  const altUrls = [
    `https://music.douyin.com/qishui/share/s/${code}/`,
    `https://music.douyin.com/s/${code}/`,
    `https://qishui.douyin.com/s/${code}/`,
  ];

  for (const u of altUrls) {
    console.log("Testing:", u);
    try {
      const res = await fetch(u, {
        headers: { "User-Agent": UA },
        redirect: "follow",
      });
      console.log("Result URL:", res.url, "Status:", res.status);
      if (res.ok) {
        const text = await res.text();
        console.log("Text len:", text.length);
        const match = text.match(/track_id=(\d+)/) || text.match(/"track_id"\s*:\s*"?(\d+)"?/);
        console.log("Track ID:", match?.[1]);
        if (match?.[1]) break;
      }
    } catch (e) {
      console.log("Error:", e.message);
    }
  }
}

testQishuiAlt();
