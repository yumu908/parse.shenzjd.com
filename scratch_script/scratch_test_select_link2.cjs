const testHtml = `
  "playAddr":"https://v16-webapp-prime.us.tiktok.com/video/tos/useast5/tos-useast5-ve-0068c004-tx/o4qEynEqQD2ESITBAZjDfDSR73AFgoMgEepqIi/?a=1988&bti=ODszNWYuMDE6&&bt=1613&ft=4KJMyMzm8Zmo0t4Cma4jVLwhQpWrKsd.&mime_type=video_mp4&rc=aGQzOmY2aDhoZTxkZWU4OEBpajM3dnU5cndmPDMzZzczNEAvNS8tM2MwNTQxLjIvLV9hYSMxMV8tMmRzcTNhLS1kMS9zcw%3D%3D&expire=1786724934&l=20260812162843771420187205FC19405C&ply_type=2&policy=2&signature=7c785a2c29bcf897a154f93526847cda&tk=tt_chain_token&btag=e000b0000",
  "downloadAddr":"https://v16-webapp-prime.us.tiktok.com/video/tos/useast5/tos-useast5-ve-0068c003-tx/oYk3f9kGUCPsAFILIgVZIAgHIHkzemIAFjQe0v/?a=1988&bti=ODszNWYuMDE6&&bt=669&ft=4KJMyMzm8Zmo0kOCma4jVcBhQpWrKsd.&mime_type=video_mp4&rc=ZTg1Omc4aGk6NThlZjdkO0BpajM3dnU5cndmPDMzZzczNEBhYS9eNV81NjQxXzEvNDMwYSMxMV8tMmRzcTNhLS1kMS9zcw%3D%3D&expire=1786721393&l=202608121529428205B162AF6CCE14AE09&ply_type=2&policy=2&signature=c428c227b9f42fbf635ec21ebd83a190&tk=tt_chain_token&btag=e000b0000"
`;

function extractNoWatermarkVideoByRegex(htmlText) {
  if (!htmlText) return "";

  const cleanText = htmlText
    .replace(/\\u0026/g, "&")
    .replace(/\\u002F/gi, "/")
    .replace(/\\/g, "")
    .replace(/&amp;/g, "&");

  const primeMatches = cleanText.match(
    /https?:\/\/[^"'\s\\]*webapp-prime[^"'\s\\]*\/video\/tos\/[^"'\s\\]*(?:mime_type=video|\.mp4)[^"'\s\\]*/gi
  );
  if (primeMatches && primeMatches.length > 0) {
    const videoMatches = primeMatches.filter((u) => !u.includes("mime_type=audio"));

    const publicStream = videoMatches.find((u) => {
      const btMatch = u.match(/[?&]bt=(\d+)/);
      if (btMatch) {
        const bt = parseInt(btMatch[1], 10);
        return bt > 0 && bt < 1200;
      }
      return false;
    });

    if (publicStream) return publicStream;
    if (videoMatches.length > 0) return videoMatches[0];
  }
  return "";
}

const selected = extractNoWatermarkVideoByRegex(testHtml);
console.log("Selected URL:");
console.log(selected);
console.log("\nDoes it contain bt=669? ", selected.includes("bt=669"));
console.log("Does it contain 0068c003? ", selected.includes("0068c003"));
