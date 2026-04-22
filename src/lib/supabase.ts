import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";

const URL  = import.meta.env.PUBLIC_SUPABASE_URL  ?? process.env.PUBLIC_SUPABASE_URL  ?? "";
const ANON = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? process.env.PUBLIC_SUPABASE_ANON_KEY ?? "";
const SERVICE = import.meta.env.SUPABASE_SERVICE_ROLE ?? process.env.SUPABASE_SERVICE_ROLE ?? "";

export function anonClient(): SupabaseClient | null {
  if (!URL || !ANON) return null;
  return createClient(URL, ANON, { auth: { persistSession: false } });
}

export function serviceClient(): SupabaseClient | null {
  if (!URL || !SERVICE) return null;
  return createClient(URL, SERVICE, { auth: { persistSession: false } });
}

export function ssrClient(cookies: AstroCookies): SupabaseClient | null {
  if (!URL || !ANON) return null;
  return createServerClient(URL, ANON, {
    cookies: {
      get: (name) => cookies.get(name)?.value,
      set: (name, value, options: CookieOptionsWithName) => {
        cookies.set(name, value, { ...options, path: "/" });
      },
      remove: (name, options) => {
        cookies.delete(name, { ...options, path: "/" });
      },
    },
  });
}
