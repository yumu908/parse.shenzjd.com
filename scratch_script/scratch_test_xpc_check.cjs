const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

async function checkXpc() {
  const url = "https://www.xinpianchang.com/a13776982?from=webShare&channel=copyLink";
  console.log("Requesting /api/parse for Xinpianchang...");
  try {
    const res = await fetch(`http://127.0.0.1:3000/api/parse?url=${encodeURIComponent(url)}`);
    console.log("Status:", res.status);
    const json = await res.json();
    console.log("JSON response:\n", JSON.stringify(json, null, 2));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

checkXpc();
