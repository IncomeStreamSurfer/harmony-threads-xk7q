import Stripe from "stripe";

const SECRET_KEY = import.meta.env.STRIPE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY ?? "";

let _stripe: Stripe | null = null;

export function stripe(): Stripe {
  if (!_stripe) {
    if (!SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not configured");
    _stripe = new Stripe(SECRET_KEY, { apiVersion: "2025-03-31.basil" });
  }
  return _stripe;
}
