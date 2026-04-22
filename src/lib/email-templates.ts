const BRAND_NAME = "Harmony Threads";
const BRAND_ACCENT = "#E63946";
const SITE_URL = (import.meta.env.PUBLIC_SITE_URL ?? process.env.PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

function layout(content: string, preheader = ""): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body { margin:0; padding:0; background:#0f0f0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif; color:#faf7f2; }
  .preheader { display:none !important; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; }
  .container { max-width:560px; margin:0 auto; padding:32px 24px; }
  .card { background:#1a1a1a; border:1px solid rgba(250,247,242,0.1); border-radius:4px; padding:32px; }
  h1 { font-family: Georgia, 'Times New Roman', serif; font-size:28px; line-height:1.2; margin:0 0 16px; letter-spacing:-0.01em; color:#faf7f2; }
  p { font-size:15px; line-height:1.6; margin:0 0 16px; color:rgba(250,247,242,0.7); }
  .btn { display:inline-block; background:${BRAND_ACCENT}; color:#fff !important; padding:12px 24px; border-radius:2px; text-decoration:none; font-weight:600; }
  .muted { color:rgba(250,247,242,0.35); font-size:13px; line-height:1.5; }
  .dot { display:inline-block; width:8px; height:8px; border-radius:50%; background:${BRAND_ACCENT}; margin-right:8px; vertical-align:middle; }
  a { color: ${BRAND_ACCENT}; }
</style></head><body>
<span class="preheader">${preheader}</span>
<div class="container">
  <div style="margin-bottom:24px;"><span class="dot"></span><strong style="font-size:18px; color:#faf7f2;">${BRAND_NAME}</strong></div>
  <div class="card">${content}</div>
  <p class="muted" style="text-align:center; margin-top:24px;">
    <a href="${SITE_URL}">${SITE_URL.replace(/^https?:\/\//, "")}</a>
  </p>
</div>
</body></html>`;
}

export function orderConfirmationHtml({ orderId, amount, currency }: { orderId: string; amount: string; currency: string }) {
  return layout(`
    <h1>Order confirmed 🎸</h1>
    <p>Thanks for your order! We've received payment and are getting it ready for you.</p>
    <p><strong style="color:#faf7f2;">Order number:</strong> ${orderId}<br /><strong style="color:#faf7f2;">Total:</strong> ${currency} ${amount}</p>
    <p class="muted">You'll receive a shipping notification with tracking info once your order is on its way. Digital downloads are available immediately.</p>
  `, `Order ${orderId} confirmed — ${currency} ${amount}`);
}

export function contactAckHtml({ name }: { name: string }) {
  return layout(`
    <h1>Got your message</h1>
    <p>Hey ${name} — thanks for reaching out to Harmony Threads. We read every message and we'll get back to you within 1 business day.</p>
  `, "We got your message");
}

export function magicLinkHtml({ loginUrl }: { loginUrl: string }) {
  return layout(`
    <h1>Your sign-in link</h1>
    <p>Click the button below to sign in. This link expires in 15 minutes and can only be used once.</p>
    <p><a class="btn" href="${loginUrl}">Sign in to ${BRAND_NAME}</a></p>
    <p class="muted">If you didn't request this, you can safely ignore this email.</p>
  `, `Sign in to ${BRAND_NAME}`);
}

export function subscriptionReceiptHtml({ plan, amount, currency, nextBillingDate }: { plan: string; amount: string; currency: string; nextBillingDate?: string }) {
  return layout(`
    <h1>Welcome to ${plan}</h1>
    <p>Your subscription is active. Here's your billing summary:</p>
    <p><strong style="color:#faf7f2;">Plan:</strong> ${plan}<br /><strong style="color:#faf7f2;">Amount:</strong> ${currency} ${amount}${nextBillingDate ? `<br /><strong style="color:#faf7f2;">Next bill:</strong> ${nextBillingDate}` : ""}</p>
  `, `Welcome to ${plan}`);
}
