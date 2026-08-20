async function run() {
  const id = "7R6CMpGYB1WQlwB82";
  const url = `https://h5.weishi.qq.com/weishi/feed/profile/${id}`;

  console.log("Testing h5.weishi.qq.com:", url);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        "Referer": "https://h5.weishi.qq.com/",
      },
      signal: AbortSignal.timeout(3000)
    });
    console.log("Status:", res.status);
    const html = await res.text();
    console.log("HTML length:", html.length);
    console.log("Snippet:", html.slice(0, 500));

    const videoMatch = html.match(/(https?:\/\/[^\s"'<>]+?\.f\d+\.mp4[^\s"'<>]*)/i) || html.match(/(https?:\/\/[^\s"'<>]+?dis_k=[^\s"'<>]*)["'\s>]/i) || html.match(/(https?:\/\/[^\s"'<>]+?\.mp4[^\s"'<>]*)/i);
    console.log("Video match:", videoMatch?.[1] || videoMatch?.[0] || "NONE");
  } catch (e) {
    console.log("Error:", e.message);
  }
}

run();
