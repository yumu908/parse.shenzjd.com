async function test() {
  const url = "https://h5.pipix.com/s/n3i1QdH1bGU/";
  const pageRes = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15" },
    redirect: "follow"
  });
  console.log("Status:", pageRes.status);
  console.log("Final URL:", pageRes.url);
  const text = await pageRes.text();
  console.log("HTML snippet:", text.slice(0, 1000));
}
test();
