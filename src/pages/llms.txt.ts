import type { APIRoute } from "astro";
import { anonClient } from "../lib/supabase";

export const prerender = false;

export const GET: APIRoute = async () => {
  const SITE = (import.meta.env.PUBLIC_SITE_URL ?? "https://harmony-threads-xk7q.vercel.app").replace(/\/$/, "");
  const sb = anonClient();

  const lines: string[] = [];
  lines.push("# Harmony Threads");
  lines.push("");
  lines.push("> Music-inspired apparel, digital books, and curated accessories for people who live the soundtrack.");
  lines.push("");
  lines.push("## Key pages");
  lines.push("");
  lines.push(`- [Home](${SITE}/): Rock band graphic tees, digital music books, and curated accessories at Harmony Threads.`);
  lines.push(`- [Shop](${SITE}/shop): Browse the full Harmony Threads catalogue — all products.`);
  lines.push(`- [About](${SITE}/about): The story behind Harmony Threads — music, taste, and curation.`);
  lines.push(`- [Contact](${SITE}/contact): Get in touch with Harmony Threads — orders, questions, sizing.`);
  lines.push("");
  lines.push("## Collections");
  lines.push("");
  lines.push(`- [Graphic Shirts](${SITE}/collections/graphic-shirts): Rock band graphic t-shirts in 4 sizes and 3 colors.`);
  lines.push(`- [Digital Books](${SITE}/collections/digital-books): Music history ebooks in PDF, Kindle, and audio formats.`);
  lines.push(`- [Accessories](${SITE}/collections/accessories): Music-inspired fragrances and lifestyle accessories.`);
  lines.push("");
  lines.push("## Products");
  lines.push("");
  lines.push(`- [The Band Graphic T-Shirt](${SITE}/product/physical-product-the-band-t-shirt): $19.99 — Unisex rock band tee in green, gray, and red. Sizes S–XL.`);
  lines.push(`- [The History of Rock Music](${SITE}/product/digital-product-the-history-of-rock-music): from $9.99 — Digital book in PDF, Kindle, and audio formats.`);
  lines.push(`- [Signature Perfume](${SITE}/product/example-perfume): $74.99 — Premium men's fragrance inspired by live music.`);

  if (sb) {
    const { data: articles } = await sb
      .from("content")
      .select("slug, title, excerpt")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(30);
    
    if (articles && articles.length > 0) {
      lines.push("");
      lines.push("## Latest articles");
      lines.push("");
      for (const a of articles) {
        lines.push(`- [${a.title}](${SITE}/blog/${a.slug}): ${a.excerpt ?? ""}`);
      }
    }
  }

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
