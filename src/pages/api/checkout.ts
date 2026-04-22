import type { APIRoute } from "astro";
import { stripe } from "../../lib/stripe";
import { anonClient } from "../../lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const { items, customer_email } = body as {
    items: Array<{ product_id: string; qty: number; variant_sku?: string }>;
    customer_email?: string;
  };

  if (!items?.length) {
    return new Response(JSON.stringify({ error: "Empty cart" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const sb = anonClient();
  if (!sb) {
    return new Response(JSON.stringify({ error: "Server not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  const { data: products, error } = await sb
    .from("products")
    .select("id, slug, name, description, price_pence, currency, image_url")
    .in("id", items.map(i => i.product_id));

  if (error || !products?.length) {
    return new Response(JSON.stringify({ error: "Products not found" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  // Also fetch variants if SKUs provided
  const skus = items.filter(i => i.variant_sku).map(i => i.variant_sku!);
  let variants: any[] = [];
  if (skus.length > 0) {
    const { data: vdata } = await sb
      .from("product_variants")
      .select("id, product_id, sku, price_pence, option1_name, option1_value, option2_name, option2_value")
      .in("sku", skus);
    variants = vdata ?? [];
  }

  const line_items = items.map((it) => {
    const p = products.find(x => x.id === it.product_id);
    if (!p) throw new Error(`Unknown product ${it.product_id}`);
    
    // Use variant price if available
    const variant = variants.find(v => v.sku === it.variant_sku && v.product_id === it.product_id);
    const unit_amount = variant?.price_pence ?? p.price_pence;
    
    const variantLabel = variant
      ? ` (${[variant.option1_value, variant.option2_value].filter(Boolean).join(", ")})`
      : "";

    return {
      quantity: Math.max(1, Math.floor(it.qty)),
      price_data: {
        currency: (p.currency ?? "usd").toLowerCase(),
        unit_amount,
        product_data: {
          name: `${p.name}${variantLabel}`,
          description: p.description?.slice(0, 300) ?? undefined,
          images: p.image_url ? [p.image_url] : undefined,
          metadata: { product_id: p.id, slug: p.slug, variant_sku: it.variant_sku ?? "" },
        },
      },
    };
  });

  const origin = import.meta.env.PUBLIC_SITE_URL
    ?? `${request.headers.get("x-forwarded-proto") ?? "https"}://${request.headers.get("x-forwarded-host") ?? request.headers.get("host")}`;

  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      line_items,
      customer_email: customer_email || undefined,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "NZ", "DE", "FR"],
      },
      metadata: {
        cart: JSON.stringify(items).slice(0, 500),
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
