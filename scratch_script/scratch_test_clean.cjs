function decodeCleanUrl(str) {
  if (!str) return "";

  let s = String(str);

  // 1. 如果包含 \u002f 或 u002f 或 %2f，彻底替换为正斜杠 /
  s = s.replace(/\\u002f/gi, "/");
  s = s.replace(/u002f/gi, "/");
  s = s.replace(/%2f/gi, "/");
  s = s.replace(/\\/g, "");

  // 2. 如果开头是 /u002f 或 u002f，变成 /
  s = s.replace(/^\/+/, "");

  // 3. 提取从第一个域名或 http 开始的部分
  const domainMatch = s.match(/(?:https?:)?\/\/?([a-zA-Z0-9.-]+\.qq\.com[^\s"']*)/i) ||
                      s.match(/([a-zA-Z0-9.-]+\.weishi\.qq\.com[^\s"']*)/i);

  if (domainMatch?.[1]) {
    return "https://" + domainMatch[1].replace(/^\/+/, "");
  }

  if (s.startsWith("http://") || s.startsWith("https://")) {
    return s;
  }

  return "https://" + s;
}

const test1 = "\\u002F\\u002Fq.weishi.qq.com\\u002Fszg_1444_50001_0bc3baaggaaa6eaiuntusnvfccgdmmeaay2a.f622.mp4?dis_k=4b85549a";
const test2 = "u002Fu002Fq.weishi.qq.comu002Fszg_1444_50001_0bc3baaggaaa6eaiuntusnvfccgdmmeaay2a.f622.mp4?dis_k=4b85549a";
const test3 = "//q.weishi.qq.com/szg_1444_50001_0bc3baaggaaa6eaiuntusnvfccgdmmeaay2a.f622.mp4";

console.log("Test 1 Result:", decodeCleanUrl(test1));
console.log("Test 2 Result:", decodeCleanUrl(test2));
console.log("Test 3 Result:", decodeCleanUrl(test3));
