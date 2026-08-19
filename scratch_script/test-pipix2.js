const https = require('https');

function getRedirect(url) {
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
      }
    }, (res) => {
      console.log("Status:", res.statusCode);
      console.log("Location header:", res.headers.location);
      resolve(res.headers.location || url);
    });
    req.on('error', (e) => {
      console.log("Error:", e.message);
      resolve(url);
    });
  });
}

async function run() {
  let u = "https://h5.pipix.com/s/n3i1QdH1bGU/";
  console.log("Initial URL:", u);
  for (let i = 0; i < 5; i++) {
    const nextUrl = await getRedirect(u);
    if (nextUrl === u) break;
    u = nextUrl;
    console.log(`Step ${i+1} URL:`, u);
  }
}
run();
