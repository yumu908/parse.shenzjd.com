const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";

async function testFetch() {
  const url = "https://qishui.douyin.com/s/iXJXkjCg/";
  console.log("1. 手动测试 Location 检查:", url);
  try {
    const res1 = await fetch(url, {
      headers: { "User-Agent": UA },
      redirect: "manual",
    });
    console.log("Status:", res1.status);
    console.log("Location header:", res1.headers.get("location"));
  } catch (e) {
    console.error("res1 error:", e);
  }

  console.log("2. 跟随重定向测试:", url);
  try {
    const res2 = await fetch(url, {
      headers: { "User-Agent": UA },
      redirect: "follow",
    });
    console.log("Final URL:", res2.url);
    const html = await res2.text();
    console.log("HTML len:", html.length);
    console.log("HTML snippet:", html.slice(0, 500));
  } catch (e) {
    console.error("res2 error:", e);
  }
}

testFetch();
