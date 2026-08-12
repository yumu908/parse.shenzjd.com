const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

async function test7R6() {
  const url = "https://isee.weishi.qq.com/ws/app-pages/share/index.html?wxplay=1&id=7R6CMpGYB1WQIwB82&spid=1786470174033647&qua=v2_iph_weishi_8.200.1_203_app_a&from_share=1&chid=100004006&pkg=3670&attach=cp_reserves3_1000060003";

  console.log("Calling 127.0.0.1:3000 for URL:", url);
  try {
    const parseRes = await fetch(`http://127.0.0.1:3000/api/parse?url=${encodeURIComponent(url)}`);
    console.log("Response status:", parseRes.status);
    const json = await parseRes.json();
    console.log("Result JSON:", JSON.stringify(json, null, 2));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

test7R6();
