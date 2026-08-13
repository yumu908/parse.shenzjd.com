const { execSync } = require('child_process');

function testCurlDouyin() {
  const url = "https://v.douyin.com/k6Xf5sA/";
  console.log("Testing curl -I on:", url);
  try {
    const out = execSync(`curl -I -s -L --max-time 5 "${url}"`, { encoding: 'utf-8' });
    console.log("Curl output:");
    console.log(out.substring(0, 500));
  } catch (e) {
    console.log("Curl error:", e.message);
  }
}

testCurlDouyin();
