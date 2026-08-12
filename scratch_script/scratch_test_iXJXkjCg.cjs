const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

async function testSingleUrl() {
  const url = "https://qishui.douyin.com/s/iXJXkjCg/";
  console.log("Testing specific link:", url);

  try {
    const res = await fetch(`http://localhost:3000/api/parse?url=${encodeURIComponent(url)}`);
    console.log("HTTP status:", res.status);
    const json = await res.json();
    console.log("Result json:", JSON.stringify(json, null, 2));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

testSingleUrl();
