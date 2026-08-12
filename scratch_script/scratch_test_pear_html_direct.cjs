const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

delete process.env.http_proxy;
delete process.env.https_proxy;

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function testPearHtmlDirect(videoId) {
  console.log("Fetching HTML directly for PearVideo vid:", videoId);
  const url = `https://www.pearvideo.com/video_${videoId}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(6000),
    });

    console.log("Status:", res.status);
    const html = await res.text();
    console.log("HTML len:", html.length);

    // 查找 HTML 内包含的视频 URL
    const matches = html.match(/srcUrl="([^"]+)"/g) || html.match(/https?:[^\s"'<>]+?\.mp4[^\s"'<>]*/ig);
    console.log("Matches found:", matches);

    const titleMatch = html.match(/<h1 class="video-tt">(.*?)<\/h1>/s) || html.match(/<title>(.*?)<\/title>/i);
    console.log("Title found:", titleMatch?.[1]?.replace(/_梨视频.*/, "").trim());

    const coverMatch = html.match(/poster="([^"]+)"/i) || html.match(/src="([^"]+?\.jpg)"/i);
    console.log("Cover found:", coverMatch?.[1]);
  } catch (e) {
    console.error("Error:", e.message);
  }
}

async function main() {
  await testPearHtmlDirect("1806992");
  await testPearHtmlDirect("1807012");
}

main();
