import {
    createApiHandler
} from "@/lib/api-middleware";
import {
    logger
} from "@/lib/api-utils";

// 从环境变量获取配置
const BILIBILI_USER_AGENT = process.env.BILIBILI_USER_AGENT ||
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36";

const BILIBILI_COOKIE = process.env.BILIBILI_COOKIE || "";

function cleanUrlParameters(url) {
    try {
        const parsed = new URL(url);
        parsed.username = "";
        parsed.password = "";
        parsed.search = "";
        parsed.pathname = parsed.pathname.replace(/\/$/, "");
        return parsed.toString();
    } catch (error) {
        logger.error("Error cleaning URL:", error.message);
        return url;
    }
}

async function bilibiliRequest(url, headers) {
    try {
        const response = await fetch(url, {
            headers: {
                ...headers,
                "User-Agent": BILIBILI_USER_AGENT,
                Cookie: BILIBILI_COOKIE,
            },
        });
        return await response.json();
    } catch (error) {
        logger.error("Error making bilibili request:", error.message);
        return null;
    }
}

async function getBilibiliVideoInfo(url) {
    try {
        const cleanUrl = cleanUrlParameters(url);
        const parsedUrl = new URL(cleanUrl);
        let bvid;

        if (parsedUrl.hostname === "b23.tv") {
            const response = await fetch(url, {
                redirect: "follow"
            });
            const redirectUrl = new URL(response.url);
            bvid = redirectUrl.pathname;
        } else if (
            parsedUrl.hostname === "www.bilibili.com" ||
            parsedUrl.hostname === "m.bilibili.com"
        ) {
            bvid = parsedUrl.pathname;
        } else {
            return {
                code: -1,
                msg: "视频链接好像不太对！"
            };
        }

        if (!bvid.includes("/video/")) {
            return {
                code: -1,
                msg: "好像不是视频链接"
            };
        }

        bvid = bvid.replace("/video/", "");
        logger.log("Processing bilibili video, bvid:", bvid);

        const headers = {
            "Content-Type": "application/json;charset=UTF-8"
        };

        // 获取视频信息
        let videoInfo = await bilibiliRequest(
            `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`,
            headers
        );

        // 如果官方 API 被 Cloudflare 边缘节点 IP 拦截 (-412) 或失败，切换到 HTML 页面 __INITIAL_STATE__ / __playinfo__ 回退解析
        if (!videoInfo || videoInfo.code !== 0) {
            logger.warn("Bilibili API returned non-zero code, attempting HTML page fallback parsing for bvid:", bvid);
            const htmlRes = await fetch(`https://m.bilibili.com/video/${bvid}`, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
                    "Referer": "https://m.bilibili.com/",
                },
            });

            if (htmlRes.ok) {
                const html = await htmlRes.text();
                let pageTitle = "";
                let pageCover = "";
                let pageAuthor = "";
                let pageAvatar = "";
                let pageUid = "";
                let videoUrl = "";

                const stateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});/);
                if (stateMatch?.[1]) {
                    try {
                        const state = JSON.parse(stateMatch[1]);
                        const v = state.videoData || {};
                        pageTitle = v.title || "";
                        pageCover = v.pic || "";
                        pageAuthor = v.owner?.name || "";
                        pageAvatar = v.owner?.face || "";
                        pageUid = String(v.owner?.mid || "");
                    } catch {}
                }

                const playinfoMatch = html.match(/window\.__playinfo__\s*=\s*({[\s\S]*?});/) || html.match(/<script>window\.__playinfo__=(.*?)<\/script>/);
                if (playinfoMatch?.[1]) {
                    try {
                        const playinfo = JSON.parse(playinfoMatch[1]);
                        videoUrl = playinfo.data?.durl?.[0]?.url || playinfo.data?.dash?.video?.[0]?.baseUrl || "";
                    } catch {}
                }

                if (!videoUrl) {
                    const mp4Match = html.match(/"url"\s*:\s*"(https?:[^\"]+?\.mp4[^\"]*)"/i) || html.match(/(https?:\/\/[^\s"'<>]+?\.mp4[^\s"'<>]*)/i);
                    if (mp4Match?.[1] || mp4Match?.[0]) {
                        videoUrl = (mp4Match[1] || mp4Match[0]).replace(/\\/g, "");
                    }
                }

                if (videoUrl || pageTitle) {
                    return {
                        code: 200,
                        msg: "解析成功",
                        platform: "bilibili",
                        data: {
                            author: pageAuthor || "未知作者",
                            uid: pageUid,
                            avatar: pageAvatar,
                            like: 0,
                            time: 0,
                            title: pageTitle || "无标题",
                            cover: pageCover,
                            type: "video",
                            url: videoUrl,
                            duration: 0,
                        },
                    };
                }
            }

            return {
                code: 404,
                msg: "解析失败！未能在 B站 找到有效播放地址",
            };
        }

        // 并行获取所有分P的播放地址
        const playUrlPromises = videoInfo.data.pages.map(async (page) => {
            const playUrl = await bilibiliRequest(
                `https://api.bilibili.com/x/player/playurl?otype=json&fnver=0&fnval=3&player=3&qn=112&bvid=${bvid}&cid=${page.cid}&platform=html5&high_quality=1`,
                headers
            );

            if (playUrl && playUrl.data?.durl?.[0]?.url) {
                // 直接使用接口返回的直链（CDN 可能是 bilivideo / akamaized 等，硬拼 mirror 会导致地址错误、播放失败）
                const url = playUrl.data.durl[0].url;
                return {
                    title: page.part,
                    duration: page.duration,
                    durationFormat: new Date((page.duration - 1) * 1000)
                        .toISOString()
                        .substr(11, 8),
                    accept: playUrl.data.accept_description,
                    url,
                };
            }
            return null;
        });

        const pages = (await Promise.all(playUrlPromises)).filter(Boolean);
        const firstPage = pages[0];

        logger.log("Successfully parsed bilibili video, pages:", pages.length);

        return {
            code: 200,
            msg: "解析成功",
            platform: "bilibili",
            data: {
                author: videoInfo.data.owner?.name || "未知作者",
                uid: String(videoInfo.data.owner?.mid || ""),
                avatar: videoInfo.data.owner?.face || "",
                like: videoInfo.data.stat?.like || 0,
                time: videoInfo.data.pubdate || 0,
                title: videoInfo.data.title || "无标题",
                cover: videoInfo.data.pic || "",
                type: "video",
                url: firstPage?.url || "",
                duration: firstPage?.duration || 0,
                pages: pages.length > 0 ? pages : undefined,
            },
        };
    } catch (error) {
        logger.error("Error parsing bilibili video:", error.message);
        return {
            code: 500,
            msg: "解析失败！"
        };
    }
}

export const GET = createApiHandler(getBilibiliVideoInfo, {
    shouldCache: false,
    responseHeaders: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
    },
});