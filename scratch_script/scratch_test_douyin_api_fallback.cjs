async function testThirdPartyDouyin() {
  const testUrl = "https://v.douyin.com/iLR8pQh9/";
  console.log("Testing third party API for Douyin short URL:", testUrl);

  // Fallback 1: vvhan API
  try {
    const res = await fetch(`https://api.vvhan.com/api/douyin?url=${encodeURIComponent(testUrl)}`, {
      signal: AbortSignal.timeout(5000)
    });
    console.log("VVHan API status:", res.status);
    if (res.ok) {
      const json = await res.json();
      console.log("VVHan API result:", JSON.stringify(json).substring(0, 300));
    }
  } catch (e) {
    console.log("VVHan API error:", e.message);
  }
}

testThirdPartyDouyin();
