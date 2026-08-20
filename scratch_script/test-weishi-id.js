async function run() {
  const id = "7R6CMpGYB1WQlwB82";
  const urls = [
    `https://m.weishi.qq.com/vise/share/index.html?id=${id}`,
    `https://v.weishi.qq.com/ws/feed/${id}`,
    `https://v.weishi.qq.com/t/${id}/`
  ];

  for (const u of urls) {
    console.log("Testing:", u);
    try {
      const res = await fetch(u, {
        headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        },
        signal: AbortSignal.timeout(5000)
      });
      console.log("Status:", res.status, "URL:", res.url);
      const html = await res.text();
      console.log("HTML len:", html.length);

      const mp4Matches = html.match(/https?:\/\/[^\s"'<>]+?\.mp4[^\s"'<>]*/gi) || [];
      console.log("Found mp4 matches count:", mp4Matches.length);
      if (mp4Matches.length > 0) {
        console.log("First mp4 match:", mp4Matches[0]);
      }

      const videoUrlMatch = html.match(/"video_url"\s*:\s*"([^"]+)"/i) || html.match(/"url"\s*:\s*"([^"]+)"/i) || html.match(/(https?:[^\s"'<>]+?\.mp4[^\s"'<>]*)/i);
      console.log("Video URL match:", videoUrlMatch?.[1] || videoUrlMatch?.[0] || "NONE");

    } catch (err) {
      console.log("Error:", err.message);
    }
    console.log("-----------------------------------------");
  }
}

run();
