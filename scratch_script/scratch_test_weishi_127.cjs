const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

async function test127() {
  const url = "https://video.weishi.qq.com/mYq1qyOC";
  console.log("Calling 127.0.0.1:3000 for URL:", url);

  try {
    const parseRes = await fetch(`http://127.0.0.1:3000/api/parse?url=${encodeURIComponent(url)}`);
    console.log("Response status:", parseRes.status);
    const json = await parseRes.json();
    console.log("Result JSON:", JSON.stringify(json, null, 2));
  } catch (e) {
    console.error("Fetch error:", e.message);
  }
}

test127();
