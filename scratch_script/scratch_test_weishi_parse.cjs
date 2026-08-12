const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function testWeishiFeedId(feedId) {
  console.log("\n=========================");
  console.log("Testing Feed ID:", feedId);
  const apiUrl = `https://h5.weishi.qq.com/webapp/json/weishi/WSH5GetPlayPage?feedid=${feedId}`;
  console.log("Requesting API:", apiUrl);

  try {
    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent": UA,
        "Referer": "https://h5.weishi.qq.com/",
        "Accept": "application/json, text/plain, */*",
      }
    });

    console.log("Status:", res.status);
    const json = await res.json();
    console.log("JSON response:", JSON.stringify(json, null, 2).slice(0, 1000));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

async function main() {
  await testWeishiFeedId("7mU7VjzWi1WS4t7kg");
  await testWeishiFeedId("71oV8vDkx1Ps22e8k");
  await testWeishiFeedId("mYq1qyOC");
}

main();
