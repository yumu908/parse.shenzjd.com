const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

async function testPuppeteerLaunch() {
  console.log("Testing puppeteer-extra launch...");
  try {
    const puppeteerExtra = require("puppeteer-extra");
    const StealthPlugin = require("puppeteer-extra-plugin-stealth");

    puppeteerExtra.use(StealthPlugin());

    console.log("Launching browser...");
    const browser = await puppeteerExtra.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    console.log("Browser launched successfully!");
    const page = await browser.newPage();
    console.log("Navigating to xinpianchang...");
    await page.goto("https://www.xinpianchang.com/a13777600", { waitUntil: "domcontentloaded", timeout: 15000 });
    console.log("Page title:", await page.title());
    const content = await page.content();
    console.log("HTML len:", content.length, "Has __NEXT_DATA__:", content.includes("__NEXT_DATA__"));
    await browser.close();
  } catch (e) {
    console.error("Puppeteer Launch Error:", e.stack || e.message);
  }
}

testPuppeteerLaunch();
