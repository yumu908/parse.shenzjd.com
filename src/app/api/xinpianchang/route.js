import { createApiHandler } from "@/lib/api-middleware";

export const runtime = "nodejs";

async function xinpianchangParse() {
  return {
    code: 400,
    msg: "新片场官方全站开启了 Cloudflare/Turnstile 人机防火墙校验盾，该平台已按需下架暂不提供解析",
  };
}

export const GET = createApiHandler(xinpianchangParse);
