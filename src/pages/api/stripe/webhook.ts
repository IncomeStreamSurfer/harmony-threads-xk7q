import type { APIRoute } from "astro";
import { stripe } from "../../../lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { sendOrderConfirmation } from "../../../lib/email";

export const prerender = false;

const WEBHOOK_SECRET = import.meta.env.STRIPE_WEBHOOK_SECRET ?? process.env.STRIPE_WEBHOOK_SECRET ?? "";
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL ?? "";
const SERVICE_ROLE = import.meta.env.SUPABASE_SERVICE_ROLE ?? process.env.SUPABASE_SERVICE_ROLE ?? "";

export const POST: APIRoute = async ({ request }) => {
  const sig = request.headers.get("stripe-signature");
  if (!sig) return new Response("no sig", { status: 400 });

  const rawBody = await request.text();
  let event: any;
  try {
    event = await stripe().webhooks.constructEventAsync(rawBody, sig, WEBHOOK_SECRET);
  } catch (err: any) {
    return new Response(`invalid sig: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    
    if (SUPABASE_URL && SERVICE_ROLE) {
      const sb = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
      await sb.from("orders").insert({
        stripe_session_id: s.id,
        stripe_payment_intent: s.payment_intent,
        customer_email: s.customer_details?.email ?? s.customer_email ?? null,
        customer_name: s.customer_details?.name ?? null,
        amount_total: s.amount_total ?? 0,
        currency: s.currency,
        status: "paid",
        line_items: s.metadata?.cart ? JSON.parse(s.metadata.cart) : [],
        shipping_address: s.shipping_details?.address ?? null,
      });
    }

    if (s.customer_details?.email) {
      await sendOrderConfirmation({
        to: s.customer_details.email,
        orderId: s.id.slice(-10).toUpperCase(),
        amount: ((s.amount_total ?? 0) / 100).toFixed(2),
        currency: (s.currency ?? "usd").toUpperCase(),
      });
    }
  }

  return new Response("ok", { status: 200 });
};
