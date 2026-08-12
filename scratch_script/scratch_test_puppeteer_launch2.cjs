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

async function testPuppeteerLaunch() {
  console.log("Testing puppeteer-extra launch with system Chrome...");
  const chromePath = getSystemChromePath();
  console.log("Using Chrome Path:", chromePath);

  try {
    const puppeteerExtra = require("puppeteer-extra");
    const StealthPlugin = require("puppeteer-extra-plugin-stealth");

    puppeteerExtra.use(StealthPlugin());

    const launchOptions = {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
      ],
    };

    if (chromePath) {
      launchOptions.executablePath = chromePath;
    } else {
      launchOptions.channel = "chrome";
    }

    console.log("Launching browser with options:", launchOptions);
    const browser = await puppeteerExtra.launch(launchOptions);

    console.log("Browser launched successfully!");
    const page = await browser.newPage();
    console.log("Navigating to xinpianchang...");
    await page.goto("https://www.xinpianchang.com/a13777600", { waitUntil: "domcontentloaded", timeout: 20000 });
    console.log("Page title:", await page.title());
    const content = await page.content();
    console.log("HTML len:", content.length, "Has __NEXT_DATA__:", content.includes("__NEXT_DATA__"));

    const nextDataMatch = content.match(/id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (nextDataMatch?.[1]) {
      const json = JSON.parse(nextDataMatch[1]);
      const detail = json?.props?.pageProps?.detail;
      console.log("PARSE SUCCESS! Title:", detail?.title);
      console.log("Video URL:", detail?.video?.content?.progressive?.[0]?.url);
    }

    await browser.close();
  } catch (e) {
    console.error("Puppeteer Launch Error:", e.stack || e.message);
  }
}

testPuppeteerLaunch();
