const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

async function test() {
  const url = "https://haokan.baidu.com/v?vid=8681216155307678584";
  console.log("Testing Haokan parse for:", url);
  const resp = await fetch(`http://localhost:3000/api/parse?url=${encodeURIComponent(url)}`);
  const json = await resp.json();
  console.log("Parse result:", JSON.stringify(json, null, 2));

  if (json.data?.url) {
    const mediaUrl = json.data.url;
    console.log("Testing proxy for mediaUrl:", mediaUrl);
    const proxyResp = await fetch(`http://localhost:3000/api/proxy?url=${encodeURIComponent(mediaUrl)}&referer=${encodeURIComponent("https://haokan.baidu.com/")}`);
    console.log("Proxy status:", proxyResp.status);
    console.log("Proxy content-type:", proxyResp.headers.get("content-type"));
    console.log("Proxy headers:", Object.fromEntries(proxyResp.headers.entries()));
  }
}

test();
