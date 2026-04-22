import type { APIRoute } from "astro";
import { ssrClient } from "../../../../lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, params, redirect }) => {
  const sb = ssrClient(cookies);
  if (!sb) return new Response("Server not configured", { status: 500 });
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { data: admin } = await sb.from("admins").select("email").eq("email", user.email ?? "").maybeSingle();
  if (!admin) return new Response("Forbidden", { status: 403 });

  const form = await request.formData();
  const patch: any = {
    name: String(form.get("name") ?? ""),
    slug: String(form.get("slug") ?? ""),
    price_pence: parseInt(String(form.get("price_pence") ?? "0")),
    inventory: parseInt(String(form.get("inventory") ?? "0")),
    description: String(form.get("description") ?? "") || null,
    body_html: String(form.get("body_html") ?? "") || null,
    image_url: String(form.get("image_url") ?? "") || null,
    meta_title: String(form.get("meta_title") ?? "") || null,
    meta_description: String(form.get("meta_description") ?? "") || null,
    published_at: form.get("published") ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await sb.from("products").update(patch).eq("id", params.id!);
  if (error) return new Response(error.message, { status: 500 });
  return redirect(`/admin/products/${params.id}?saved=1`);
};
