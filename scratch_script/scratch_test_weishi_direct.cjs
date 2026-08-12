const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

async function testDirectApi() {
  const url = "https://video.weishi.qq.com/9UdU0HkD";
  console.log("Calling localhost /api/parse for URL:", url);

  try {
    const parseRes = await fetch(`http://localhost:3000/api/parse?url=${encodeURIComponent(url)}`);
    console.log("Response status:", parseRes.status);
    const json = await parseRes.json();
    console.log("Result JSON:", JSON.stringify(json, null, 2));
  } catch (e) {
    console.error("Fetch error:", e.message);
  }
}

testDirectApi();
