const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

function getSystemChromePath() {
  const possiblePaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    path.join(process.env.LOCALAPPDATA || "", "Google\\Chrome\\Application\\chrome.exe"),
    path.join(process.env.PROGRAMFILES || "", "Google\\Chrome\\Application\\chrome.exe"),
    path.join(process.env["PROGRAMFILES(X86)"] || "", "Microsoft\\Edge\\Application\\msedge.exe"),
  ];

  for (const p of possiblePaths) {
    if (p && fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

async function testDirectWeiboPup(fid) {
  console.log("Launching Puppeteer for Weibo fid:", fid);
  const chromePath = getSystemChromePath();

  try {
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");

    console.log("Navigating directly to https://weibo.com/tv/show/" + fid);
    await page.goto(`https://weibo.com/tv/show/${fid}`, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    const cookies = await page.cookies();
    console.log("Captured Cookies:", cookies.map(c => `${c.name}=${c.value}`));

    const content = await page.content();
    console.log("Page HTML len:", content.length);

    const mp4Match =
      content.match(/https?:[^\s"'<>]+?\.mp4[^\s"'<>]*/i) ||
      content.match(/"url"\s*:\s*"(https?:[^\"]+?\.mp4[^\"]*)"/i);

    console.log("Found MP4 in HTML:", mp4Match?.[1] || mp4Match?.[0]);

    await browser.close();
  } catch (e) {
    console.error("Puppeteer Direct Error:", e.stack || e.message);
  }
}

testDirectWeiboPup("1034:5326514065965150");
