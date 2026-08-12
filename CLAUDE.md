# CLAUDE.md

本文件为 AI 助手与开发者在此代码库中工作时提供技术指导与开发规范。

## 项目概述

ParseShort 是一个基于 **Next.js 15**（App Router、React 19）构建的短视频解析与下载服务。它支持解析 22+ 国内外主流社交媒体平台（包括抖音、Bilibili、快手、微博、小红书、TikTok、Facebook、Twitter/X 等）的视频链接。前端为单页应用（SPA），后端由一系列 API 路由处理程序构成。

## 开发命令

```bash
npm run dev       # 启动开发服务器（基于 Turbopack）
npm run build     # 生产环境打包构建
npm start         # 启动生产环境服务器
npm run lint      # 代码规范检查 (next lint)
npm test          # 单元测试（基于 Vitest，无网络请求）
npm run test:watch # 监听模式下的 Vitest 测试
npm run test:live  # 线上真实集成测试（需设置 RUN_LIVE_PARSE=1 并在 .env.local 配置 URL）
```

运行单个测试文件：`npx vitest run tests/share.test.ts`

## 架构说明

### 后端架构：中间件 + 各平台解析路由

所有平台 API 路由（`src/app/api/{platform}/route.js`）遵循统一的导出模式：

```javascript
export const GET = createApiHandler(parseFunction);
```

`createApiHandler()`（位于 `src/lib/api-middleware.js`）为每个解析器包装了如下通用能力：可选的 Basic 身份验证、基于 IP 的速率限制（60次/分钟）、URL 合法性校验、SSRF 内网防护、5分钟内存缓存（可通过 `{ shouldCache: false }` 禁用）、CORS 跨域支持以及统一异常处理。

平台解析器均为独立的异步函数（而非类）。标准流程包括：跟进短链重定向 → 伪造 User-Agent 请求 HTML 源码 → 提取视频 ID → 正则提取或解析嵌入的 JSON 数据（如 `window._ROUTER_DATA`、`__APOLLO_STATE__` 等）→ 返回结构化 JSON 响应。快手解析器（`src/lib/kuaishouCore.js`）例外，它采用了多策略解析类实现。

统一解析接口 `/api/parse` 会根据传入的 URL 自动识别所属平台并动态导入对应的解析路由。该接口运行在 Edge runtime 运行环境中。绝大多数路由使用 Edge runtime，抖音路由为了 Docker 兼容性显式指定了 Node.js runtime。

媒体代理路由（`/api/proxy/route.ts`）负责携带正确的 Referer/Cookie 请求头转发媒体流，对 Bilibili 和抖音等 CDN 做了特殊防盗链处理。

### 前端架构：单页应用

- `src/components/VideoParserForm.tsx` — 主解析表单：自动读取剪贴板、防抖提取 URL、自动检测平台、在 sessionStorage 中缓存解析结果
- `src/components/videos/` — 平台专用的解析结果展示组件，通过 `index.ts` 集中导出
- `src/utils/share.ts` — 从分享文本中提取 URL 以及平台自动检测逻辑
- `src/config/video-platforms.ts` — 平台 UI 元数据（名称、主题色、图标）
- `src/lib/platforms.js` — 服务端使用的平台域名映射注册表

### 核心 Lib 库文件

- `src/lib/parser-core.js` — BaseParser 基类 + ParserRegistry 解析注册表
- `src/lib/api-utils.js` — 缓存控制、速率限制、SSRF 防护与标准响应辅助工具
- `src/lib/redirect-location.js` — 短链 3xx 重定向跟进工具
- `src/lib/meipai-decode.js` — 美拍视频 Base64 解密算法

## 环境变量配置

在 `.env.local` 中配置以下环境变量以开启完整功能：

- `DOUYIN_COOKIE`, `DOUYIN_USER_AGENT` — 抖音解析凭证
- `BILIBILI_COOKIE` — Bilibili 解析凭证
- `WEIBO_COOKIE` — 微博解析凭证
- `API_AUTH_USERNAME`, `API_AUTH_PASSWORD` — API 可选 Basic 验证账号密码
- `LIVE_URL_*`（23个变量）— 真实集成测试用的视频分享链接（参见 `tests/live/urls.example.env`）

## 开发规范

- **JS/TS 混合开发**：核心 lib 库文件与 API 路由为纯 JS (`src/lib/*.js`, `src/app/api/**/route.js`)，前端组件为 TSX (`.tsx`)，类型定义位于 `src/types/`
- **路径别名**：`@/*` 映射至 `./src/*`（已在 tsconfig 与 vitest 中配置）
- **包管理器**：统一使用 `npm`
- **API 响应格式**：`{ code: 200, msg: "...", data: {...}, platform: "..." }`

## TikTok 与 Facebook 解析与播放技术笔记

- **TikTok JSON 字符转义**：嵌入的 JSON 中斜杠被转义为 `\/`。正则匹配前必须还原 `\u002F`、`\` 以及 `&amp;`。
- **签名完整性保护**：切勿篡改 TikTok CDN URL 路径（如将 `-pve-` 改为 `-ve-`），否则 HMAC 签名失效抛出 HTTP 403。
- **码率智能选择**：优先选择公网畅播流 `bt < 1200`（如 `bt=669`），避开需 VIP 鉴权的 1080p 限制流 `bt > 1200`（HTTP 403）。
- **禁用服务端缓存**：对短时效 CDN 接口传入 `{ shouldCache: false }`，确保每次获取最新有效直链。
- **跨域下载同源代理**：下载按钮使用 `/api/proxy?url=...&disposition=attachment` 触发真实文件保存，防止浏览器跨域直接打开新标签页。

## 项目部署

支持三种部署目标：Vercel（一键部署）、Cloudflare Workers（`wrangler.toml`）、Docker（通过 GitHub Actions 自动构建并发布至 GHCR 与 Docker Hub）。Docker CI 工作流在构建前会自动执行单元测试。
