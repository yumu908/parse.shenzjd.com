async function run() {
  const bvid = "BV1oLuY6CEHf";
  
  // 1. Get view info
  const viewUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
  const viewRes = await fetch(viewUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
      "Referer": "https://www.bilibili.com/",
      "Cookie": "buvid3=INFOC_1234567890_1234567890; b_nut=1234567890;"
    }
  });
  const viewData = await viewRes.json();
  console.log("View code:", viewData.code, "msg:", viewData.message);
  const cid = viewData.data?.pages?.[0]?.cid || viewData.data?.cid;
  console.log("Cid:", cid);

  if (!cid) return;

  // 2. Test playurl API with Mobile UA
  const playUrlMobile = `https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=64&platform=html5&high_quality=1`;
  console.log("\nTesting PlayURL Mobile API:", playUrlMobile);
  const playResMobile = await fetch(playUrlMobile, {
    headers: {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
      "Referer": "https://www.bilibili.com/",
      "Cookie": "buvid3=INFOC_1234567890_1234567890; b_nut=1234567890;"
    }
  });
  const playDataMobile = await playResMobile.json();
  console.log("PlayData Mobile code:", playDataMobile.code, "msg:", playDataMobile.message);
  console.log("PlayData Mobile durl url:", playDataMobile.data?.durl?.[0]?.url?.slice(0, 120));

  // 3. Test playurl PC API (x/player/wbi/playurl or x/player/playurl with qn=16)
  const playUrlPC = `https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=16&type=&otype=json&platform=html5`;
  console.log("\nTesting PlayURL PC API:", playUrlPC);
  const playResPC = await fetch(playUrlPC, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Referer": "https://www.bilibili.com/",
      "Cookie": "buvid3=INFOC_1234567890_1234567890; b_nut=1234567890;"
    }
  });
  const playDataPC = await playResPC.json();
  console.log("PlayData PC code:", playDataPC.code, "msg:", playDataPC.message);
  console.log("PlayData PC durl url:", playDataPC.data?.durl?.[0]?.url?.slice(0, 120));
}

run();
