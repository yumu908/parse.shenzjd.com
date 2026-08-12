const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

async function testIsee() {
  const url1 = "https://isee.weishi.qq.com/ws/app-pages/share/index.html?id=7mU7VjzWi1WS4t7kg";
  const url2 = "https://m.weishi.qq.com/vise/share/index.html?id=7mU7VjzWi1WS4t7kg";

  console.log("Testing URL 1:", url1);
  try {
    const res = await fetch(`http://127.0.0.1:3000/api/parse?url=${encodeURIComponent(url1)}`);
    console.log("Status:", res.status);
    const json = await res.json();
    console.log("JSON 1:", JSON.stringify(json, null, 2));
  } catch (e) {
    console.error("Error 1:", e.message);
  }

  console.log("\nTesting URL 2:", url2);
  try {
    const res = await fetch(`http://127.0.0.1:3000/api/parse?url=${encodeURIComponent(url2)}`);
    console.log("Status:", res.status);
    const json = await res.json();
    console.log("JSON 2:", JSON.stringify(json, null, 2));
  } catch (e) {
    console.error("Error 2:", e.message);
  }
}

testIsee();
