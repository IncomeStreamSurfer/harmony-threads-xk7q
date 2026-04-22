import type { APIRoute } from "astro";
import { serviceClient } from "../../lib/supabase";
import { hitOrReject } from "../../lib/rate-limit";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { ok, retryAfterSec } = hitOrReject(ip);
  if (!ok) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec), "Content-Type": "application/json" },
    });
  }

  const formData = await request.formData();
  
  // Honeypot
  if (formData.get("website")) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }
  
  // Timing
  const renderedAt = Number(formData.get("rendered_at") ?? 0);
  if (Date.now() - renderedAt < 3000) {
    return new Response(JSON.stringify({ error: "Submitted too fast" }), { status: 400 });
  }

  const email = String(formData.get("email") ?? "").trim().slice(0, 300);
  if (!email || !email.includes("@")) {
    return new Response(JSON.stringify({ error: "Valid email required" }), { status: 400 });
  }

  const sb = serviceClient();
  if (sb) {
    await sb.from("subscribers").upsert({ email, source: "newsletter" }, { onConflict: "email" });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
