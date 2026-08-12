const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function testWeishiPost(feedId) {
  console.log("\nTesting POST API for feedId:", feedId);
  const apiUrl = "https://h5.weishi.qq.com/webapp/json/weishi/WSH5GetPlayPage";

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "User-Agent": UA,
        "Referer": "https://h5.weishi.qq.com/",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ feedid: feedId })
    });

    console.log("POST status:", res.status);
    const json = await res.json();
    console.log("POST Result JSON:", JSON.stringify(json, null, 2).slice(0, 800));
  } catch (e) {
    console.error("POST Error:", e.message);
  }
}

async function main() {
  await testWeishiPost("7mU7VjzWi1WS4t7kg");
}

main();
