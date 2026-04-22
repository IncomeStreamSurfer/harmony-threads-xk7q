import { orderConfirmationHtml, contactAckHtml } from "./email-templates";

const RESEND_KEY = import.meta.env.RESEND_API_KEY ?? process.env.RESEND_API_KEY ?? "";
const FROM = import.meta.env.EMAIL_FROM ?? process.env.EMAIL_FROM ?? "Harmony Threads <onboarding@resend.dev>";
const REPLY_TO = import.meta.env.EMAIL_REPLY_TO ?? process.env.EMAIL_REPLY_TO ?? undefined;

type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
};

export async function sendEmail(args: SendArgs): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!RESEND_KEY) {
    console.warn("[email] RESEND_API_KEY not set; skipping");
    return { ok: false, error: "RESEND_API_KEY not set" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: Array.isArray(args.to) ? args.to : [args.to],
        subject: args.subject,
        html: args.html,
        text: args.text,
        reply_to: args.replyTo ?? REPLY_TO,
        tags: args.tags,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Resend ${res.status}: ${body.slice(0, 200)}` };
    }
    const json = await res.json() as { id?: string };
    return { ok: true, id: json.id };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? String(err) };
  }
}

export async function sendOrderConfirmation(args: { to: string; orderId: string; amount: string; currency: string }) {
  return sendEmail({
    to: args.to,
    subject: `Order ${args.orderId} confirmed — ${args.currency} ${args.amount}`,
    html: orderConfirmationHtml({ orderId: args.orderId, amount: args.amount, currency: args.currency }),
    tags: [{ name: "type", value: "order_confirmation" }, { name: "order_id", value: args.orderId }],
  });
}

export async function sendContactAck(args: { to: string; name: string }) {
  return sendEmail({
    to: args.to,
    subject: "We got your message — Harmony Threads",
    html: contactAckHtml({ name: args.name }),
    tags: [{ name: "type", value: "contact_ack" }],
  });
}
