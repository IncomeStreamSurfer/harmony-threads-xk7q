import { defineMiddleware } from "astro:middleware";
import { ssrClient } from "./lib/supabase";

export const onRequest = defineMiddleware(async (ctx, next) => {
  const sb = ssrClient(ctx.cookies);
  if (sb) {
    try {
      const { data } = await sb.auth.getUser();
      ctx.locals.user = data.user ?? null;
    } catch {
      ctx.locals.user = null;
    }
  } else {
    ctx.locals.user = null;
  }

  const response = await next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  return response;
});
