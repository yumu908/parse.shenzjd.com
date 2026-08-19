async function testDouyu() {
  const url = "https://v.douyu.com/show/yVmjvBAxgeNWqkNb";
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    }
  });
  console.log("Status:", res.status);
  const html = await res.text();
  console.log("HTML length:", html.length);

  // Match $DATA or window.DATA or video info
  const dataMatch = html.match(/\$DATA\s*=\s*({[\s\S]*?});/) || html.match(/window\.\$DATA\s*=\s*({[\s\S]*?});/);
  if (dataMatch?.[1]) {
    console.log("Found $DATA match, length:", dataMatch[1].length);
    console.log("$DATA snippet:", dataMatch[1].slice(0, 500));
  } else {
    console.log("No $DATA match in HTML.");
    const scripts = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
    console.log("Total script tags found:", scripts.length);
    for (const s of scripts) {
      if (s.includes("VIDEO") || s.includes("POINT") || s.includes("point_id")) {
        console.log("Script snippet with video info:", s.slice(0, 300));
      }
    }
  }
}
testDouyu();
