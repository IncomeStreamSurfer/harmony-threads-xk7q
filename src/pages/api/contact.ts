import type { APIRoute } from "astro";
import { serviceClient } from "../../lib/supabase";
import { hitOrReject } from "../../lib/rate-limit";
import { sendContactAck } from "../../lib/email";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { ok, retryAfterSec } = hitOrReject(ip);
  if (!ok) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec), "Content-Type": "application/json" },
    });
  }

  const formData = await request.formData();
  
  // Honeypot check
  if (formData.get("website")) {
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  
  // Timing check
  const renderedAt = Number(formData.get("rendered_at") ?? 0);
  if (Date.now() - renderedAt < 3000) {
    return new Response(JSON.stringify({ error: "Submitted too fast" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const name = String(formData.get("name") ?? "").trim().slice(0, 200);
  const email = String(formData.get("email") ?? "").trim().slice(0, 300);
  const message = String(formData.get("message") ?? "").trim().slice(0, 5000);

  if (!name || !email || !message) {
    return new Response(JSON.stringify({ error: "All fields required" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const sb = serviceClient();
  if (sb) {
    await sb.from("contact_messages").insert({ name, email, message });
  }

  // Send acknowledgement email (non-blocking — don't fail the request)
  sendContactAck({ to: email, name }).catch(() => {});

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
};
