# 项目规则与技术开发笔记

## TikTok 与 Facebook 解析注意事项与避坑指南

### 1. TikTok URL 字符转义处理
- TikTok 网页嵌入的 JSON 脚本块会将斜杠转义为 `\/`（例如 `https:\/\/v16-webapp-prime...`）。
- 在对 TikTok HTML/JSON 源码运行正则匹配之前，必须先执行 `.replace(/\\u0026/g, "&").replace(/\\u002F/gi, "/").replace(/\\/g, "").replace(/&amp;/g, "&")` 进行解转义。

### 2. TikTok 加密签名防篡改警告
- TikTok CDN URL 包含了 HMAC 签名（`signature=...`）。
- 切勿手动篡改 CDN 路径字符串（例如将 `-pve-` 替换为 `-ve-` 或修改路径中的 Hash 值）。篡改字符串会导致签名失效并返回 HTTP 403 Forbidden 错误。视频 URL 必须通过正则从原源码中原样提取。

### 3. TikTok 码率遴选规则（403 封禁流 vs 公网畅播流）
- TikTok 每个视频会返回多条不同码率的媒体流。
- `bt > 1200` 的高码率流（例如 `bt=1613`，1080p `0068c004`）需要 App 会话 Token，对公网匿名请求会返回 HTTP 403 Forbidden。
- `bt < 1200` 的标准码率流（例如 `bt=669`，720p `0068c003`）属于公网开放流，可以无障碍流畅播放。
- 提取无水印 MP4 直链时，必须筛选 `bt > 0 && bt < 1200` 的畅播流。

### 4. 短时效 CDN 链接的服务端缓存控制
- 带有临时签名 Token 的 CDN 链接过期时间较短。
- 在 `createApiHandler()` 中为 TikTok（`/api/tiktok`）和 Facebook（`/api/facebook`）设置 `{ shouldCache: false }`，确保 API 始终返回新鲜、未过期的直链。

### 5. HTML5 播放器双重 src 赋值竞态修复
- 对于非 m3u8 的 MP4 视频，如果 JSX `<video src={...}>` 已经设置了 `src`，切勿在 React `useEffect` 中再次对 `videoRef.current.src` 赋值。
- 重复赋值会导致浏览器取消正在进行的媒体请求，触发伪 `onError` 报错事件。
- 在 `onError` 处理函数中，应检查 `videoRef.current.readyState >= 2`，避免误将正常加载判定为错误。

### 6. HTML5 跨域 download 属性限制与同源代理下载
- 现代浏览器会强制忽略指向跨域 URL（如 TikTok CDN）的 `<a href="..." download>` 属性，直接在新标签页中打开链接。
- 下载按钮必须路由至同源代理接口 `/api/proxy?url=...&disposition=attachment&filename=...`，利用 `Content-Disposition: attachment` 响应头拉起文件保存下载框。
