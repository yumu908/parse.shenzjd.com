const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function testApi(url) {
  console.log("Testing API:", url);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        "Referer": "https://h5.weishi.qq.com/",
        "Accept": "application/json, text/plain, */*",
      }
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Text len:", text.length, "Snippet:", text.slice(0, 300));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

async function main() {
  const ids = ["9UdU0HkD", "D3C21BTy"];
  for (const id of ids) {
    console.log("\n=========================");
    console.log("Testing ID:", id);
    await testApi(`https://h5.weishi.qq.com/webapp/json/weishi/WSH5GetPlayPage?feedid=${id}`);
    await testApi(`https://isee.weishi.qq.com/ws/api/weishi/WSH5GetPlayPage?feedid=${id}`);
    await testApi(`https://h5.weishi.qq.com/weishi/feed/profile/${id}`);
    await testApi(`https://isee.weishi.qq.com/ws/app-pages/share/index.html?fx=1&feedid=${id}`);
  }
}

main();
