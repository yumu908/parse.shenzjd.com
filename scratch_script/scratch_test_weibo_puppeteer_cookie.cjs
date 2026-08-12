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

async function getWeiboVisitorCookieWithPuppeteer() {
  console.log("Launching system Chrome to generate Weibo Visitor Cookie...");
  const chromePath = getSystemChromePath();
  console.log("Chrome Path:", chromePath);

  try {
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");

    console.log("Navigating to Weibo visitor page...");
    await page.goto("https://passport.weibo.com/visitor/visitor?entry=miniblog", {
      waitUntil: "networkidle2",
      timeout: 15000,
    }).catch(() => null);

    const cookies = await page.cookies();
    console.log("Captured Cookies:", cookies.map(c => `${c.name}=${c.value}`));

    const sub = cookies.find(c => c.name === "SUB");
    const subp = cookies.find(c => c.name === "SUBP");

    await browser.close();

    if (sub) {
      const cookieStr = `SUB=${sub.value}; ${subp ? `SUBP=${subp.value};` : ""}`;
      console.log("SUCCESS! Generated Cookie:", cookieStr);
      return cookieStr;
    }
  } catch (e) {
    console.error("Puppeteer Error:", e.stack || e.message);
  }
  return null;
}

async function main() {
  const cookie = await getWeiboVisitorCookieWithPuppeteer();
  if (cookie) {
    console.log("\nTesting weibo.com POST API with newly generated Cookie...");
    const fid = "1034:5326514065965150";
    const postData = `data={\"Component_Play_Playinfo\":{\"oid\":\"${fid}\"}}`;
    const res = await fetch(`https://weibo.com/tv/api/component?page=/tv/show/${fid}`, {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": `https://weibo.com/tv/show/${fid}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": cookie,
      },
      body: postData,
    });

    console.log("API Status:", res.status);
    const json = await res.json();
    console.log("API JSON:\n", JSON.stringify(json, null, 2).slice(0, 800));

    const playInfo = json?.data?.Component_Play_Playinfo;
    if (playInfo?.urls) {
      console.log("VICTORY! VIDEO URL IS:\n", Object.values(playInfo.urls)[0]);
    }
  }
}

main();
