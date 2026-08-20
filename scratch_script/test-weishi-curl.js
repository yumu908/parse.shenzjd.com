const { exec } = require('child_process');

function runCurl(url) {
  return new Promise((resolve) => {
    const cmd = `curl -s -L -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15" "${url}"`;
    exec(cmd, { timeout: 8000 }, (err, stdout, stderr) => {
      resolve({ err, stdout: stdout || "", stderr });
    });
  });
}

async function run() {
  const id = "7R6CMpGYB1WQlwB82";
  const urls = [
    `https://isee.weishi.qq.com/ws/app-pages/share/index.html?id=${id}&wxplay=1`,
    `https://m.weishi.qq.com/vise/share/index.html?id=${id}`,
    `https://h5.weishi.qq.com/weishi/feed/profile/${id}`,
    `https://v.weishi.qq.com/t/${id}/`
  ];

  for (const u of urls) {
    console.log("Curling:", u);
    const res = await runCurl(u);
    console.log("Output len:", res.stdout.length);
    if (res.stdout.length > 0) {
      console.log("Snippet:", res.stdout.slice(0, 300));
      const videoMatch = res.stdout.match(/(https?:[^\s"'<>]+?\.mp4[^\s"'<>]*)/i) || res.stdout.match(/dis_k=[^\s"'<>]*/i);
      console.log("Video match:", videoMatch?.[0] || "NONE");
    } else if (res.err) {
      console.log("Curl error:", res.err.message);
    }
    console.log("----------------------------------------");
  }
}

run();
