import type { APIRoute } from "astro";
import { anonClient } from "../lib/supabase";

export const prerender = false;

export const GET: APIRoute = async () => {
  const sb = anonClient();
  const stripHtml = (html: string) =>
    html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  let body = "# Harmony Threads — Full Site Content\n\n";
  body += "Music-inspired apparel, digital books, and curated accessories.\n\n---\n\n";

  body += "# Home\n\nHarmony Threads is a music-inspired merch store selling rock band graphic tees, digital music books, and curated accessories. Our flagship product is The Band Graphic T-Shirt, available in sizes Small through XL in green, gray, and red colorways at $19.99. We also carry The History of Rock Music digital book from $9.99 in PDF, Kindle, and audio formats, plus a premium Signature Perfume at $74.99.\n\n---\n\n";
  body += "# About\n\nHarmony Threads started as a passion project — finding the intersection between the bands that changed culture and the clothes worth wearing twice. We launched in 2024 with three products and one principle: only stock what you'd actually wear or read yourself. Curation over volume. Context, not merch. Built to last.\n\n---\n\n";

  if (sb) {
    const { data: products } = await sb
      .from("products")
      .select("name, description, body_html, price_pence, currency")
      .not("published_at", "is", null);

    if (products) {
      for (const p of products) {
        body += `# Product: ${p.name}\n\nPrice: $${(p.price_pence / 100).toFixed(2)} ${p.currency ?? "USD"}\n\n`;
        body += `${p.description ?? ""}\n\n`;
        if (p.body_html) body += `${stripHtml(p.body_html)}\n\n`;
        body += "---\n\n";
      }
    }

    const { data: pages } = await sb
      .from("pages")
      .select("title, body_html")
      .not("published_at", "is", null);

    if (pages) {
      for (const page of pages) {
        if (page.body_html) {
          body += `# ${page.title}\n\n${stripHtml(page.body_html)}\n\n---\n\n`;
        }
      }
    }
  }

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
