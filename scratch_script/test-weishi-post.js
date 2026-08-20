async function run() {
  const id = "7R6CMpGYB1WQlwB82";
  const url = "https://h5.weishi.qq.com/webapp/json/weishi/WnsFeedDetail";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15",
        "Referer": "https://h5.weishi.qq.com/"
      },
      body: JSON.stringify({ feedid: id }),
      signal: AbortSignal.timeout(4000)
    });
    console.log("POST Status:", res.status);
    const json = await res.json();
    console.log("POST JSON:", JSON.stringify(json).slice(0, 400));
  } catch (e) {
    console.log("POST Error:", e.message);
  }
}

run();
