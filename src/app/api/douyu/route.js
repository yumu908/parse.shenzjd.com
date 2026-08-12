import { createApiHandler } from "@/lib/api-middleware";
import fs from "fs";

export const runtime = "nodejs";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/**
 * 查找系统已安装的 Edge / Chrome / Chromium 浏览器路径 (跨平台支持: Linux, macOS, Windows)
 */
function getExecutablePath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const localAppData = process.env.LOCALAPPDATA || "";
  const paths = [
    // Linux 常用安装路径 (如 Ubuntu / Debian / CentOS / Docker)
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
    "/usr/bin/microsoft-edge",
    "/usr/bin/microsoft-edge-stable",

    // macOS 常用安装路径
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",

    // Windows 常用安装路径
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    localAppData + "\\Google\\Chrome\\Application\\chrome.exe",
    localAppData + "\\Microsoft\\Edge\\Application\\msedge.exe",
  ];

  for (const p of paths) {
    try {
      if (p && fs.existsSync(p)) return p;
    } catch {}
  }
  return undefined;
}

let globalBrowser = null;

/**
 * 获取或复用单例无头浏览器进程 (避免每次请求重新启动 EXE)
 */
async function getBrowser() {
  let puppeteer;
  try {
    puppeteer = (await import("puppeteer-core")).default;
  } catch {
    console.log("[Douyu Puppeteer] 未安装 puppeteer-core 模块");
    return null;
  }

  if (globalBrowser && globalBrowser.isConnected()) {
    return globalBrowser;
  }

  const executablePath = getExecutablePath();
  const launchOptions = {
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
      "--blink-settings=imagesEnabled=false",
    ],
  };

  if (executablePath) {
    launchOptions.executablePath = executablePath;
    console.log(`[Douyu Puppeteer] 使用系统浏览器: ${executablePath}`);
  } else {
    launchOptions.channel = "msedge";
    console.log(`[Douyu Puppeteer] 未发现指定路径浏览器，尝试使用系统默认 Edge (msedge)...`);
  }

  try {
    globalBrowser = await puppeteer.launch(launchOptions);
    globalBrowser.on("disconnected", () => {
      console.log(`[Douyu Puppeteer] 浏览器进程已断开，下次请求将自动重建`);
      globalBrowser = null;
    });
    return globalBrowser;
  } catch (err) {
    console.warn(
      `[Douyu Puppeteer 提醒] 未能在当前系统中找到或启动 Chrome/Edge 浏览器。` +
      `如果是 Linux 服务器，请运行 "apt install -y chromium-browser" 即可。详细错误: ${err.message}`
    );
    globalBrowser = null;
    return null;
  }
}

/**
 * 使用 Puppeteer-Core 运行无头浏览器，打开斗鱼视频页面并执行签名与抓包（极速秒切版）
 */
async function parseViaPuppeteer(hashId) {
  const browser = await getBrowser();
  if (!browser) return null;

  let page = null;
  try {
    const startTime = Date.now();
    console.log(`[Douyu Puppeteer] 极速捕获开始: ${hashId}`);
    page = await browser.newPage();
    await page.setUserAgent(UA);

    // 屏蔽无用静态资源
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      if (["image", "stylesheet", "font"].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    let done = false;
    const result = await new Promise((resolve) => {
      const timeoutTimer = setTimeout(() => {
        if (!done) {
          done = true;
          resolve(null);
        }
      }, 10000);

      page.on("response", async (response) => {
        if (done) return;
        const url = response.url();

        if (url.includes("playlist.m3u8") || (url.includes(".m3u8") && url.includes("douyu"))) {
          done = true;
          clearTimeout(timeoutTimer);
          const elapsed = Date.now() - startTime;
          console.log(`[Douyu Puppeteer] ⚡ 极速命中 m3u8 (${elapsed}ms): ${url}`);

          let title = "";
          let cover = "";
          try {
            title = await page.evaluate(() => window.$DATA?.VIDEO?.title || document.title || "");
            cover = await page.evaluate(() => window.$DATA?.VIDEO?.cover || "");
          } catch {}

          resolve({ url, title, cover });
        } else if (url.includes("vodStream.do") || url.includes("getStreamUrlWeb")) {
          try {
            const text = await response.text();
            if (text.includes("surl")) {
              const json = JSON.parse(text);
              const item = Array.isArray(json) ? json[0] : json;
              if (item?.surl) {
                done = true;
                clearTimeout(timeoutTimer);
                const elapsed = Date.now() - startTime;
                console.log(`[Douyu Puppeteer] ⚡ 极速命中 surl (${elapsed}ms): ${item.surl}`);

                let title = "";
                let cover = "";
                try {
                  title = await page.evaluate(() => window.$DATA?.VIDEO?.title || document.title || "");
                  cover = await page.evaluate(() => window.$DATA?.VIDEO?.cover || "");
                } catch {}

                resolve({ url: item.surl, title, cover });
              }
            }
          } catch {}
        }
      });

      const targetUrl = `https://v.douyu.com/show/${hashId}`;
      page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => {});
    });

    return result;
  } catch (err) {
    console.log(`[Douyu Puppeteer 异常]: ${err.message}`);
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
  }

  return null;
}

// 斗鱼 hashId 专属内存缓存 (30分钟 TTL)
const hashIdCache = new Map();
const HASH_CACHE_TTL = 30 * 60 * 1000;

async function parseVideoId(hashId) {
  // 1. 优先校验 hashId 级别缓存
  const cached = hashIdCache.get(hashId);
  if (cached && Date.now() - cached.timestamp < HASH_CACHE_TTL) {
    console.log(`[Douyu Cache 命中] hashId: ${hashId} -> 0ms 毫秒级极速响应`);
    return cached.data;
  }

  console.log(`[Douyu Parse] 开始解析 hashId: ${hashId}`);
  let videoUrl = null;
  let title = "";
  let author = "";
  let cover = "";

  // 直接启动 Puppeteer 进行高命中率拦截，无需等待必失败的 400/404 HTTP 接口
  const pupResult = await parseViaPuppeteer(hashId);
  if (pupResult?.url) {
    videoUrl = pupResult.url;
    if (pupResult.title) title = pupResult.title;
    if (pupResult.cover) cover = pupResult.cover;
  }

  console.log(`[Douyu Parse] 最终视频地址结果: ${videoUrl}`);

  if (videoUrl) {
    const resData = {
      code: 200,
      msg: "解析成功",
      data: {
        title,
        author,
        avatar: "",
        uid: "",
        cover,
        url: videoUrl.replace(/\\/g, ""),
      },
    };
    // 写入 hashId 缓存
    hashIdCache.set(hashId, { data: resData, timestamp: Date.now() });
    return resData;
  }

  return { code: 404, msg: "斗鱼视频解析失败：无法获取播放地址" };
}

async function douyuParse(shareUrl) {
  const m =
    shareUrl.match(/\/show\/([A-Za-z0-9]+)/) ||
    shareUrl.match(/vid=([A-Za-z0-9]+)/);
  if (!m?.[1]) {
    return { code: 400, msg: "无法从斗鱼链接解析视频 vid" };
  }
  return parseVideoId(m[1]);
}

export const GET = createApiHandler(douyuParse);