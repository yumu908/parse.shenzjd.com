const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

async function testSixroomFinal() {
  const url = "https://v.6.cn/minivideo/7457364";
  console.log("Testing /api/parse for Sixroom URL:", url);
  try {
    const res = await fetch(`http://127.0.0.1:3000/api/parse?url=${encodeURIComponent(url)}`);
    console.log("Status:", res.status);
    const json = await res.json();
    console.log("JSON response:\n", JSON.stringify(json, null, 2));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

testSixroomFinal();
