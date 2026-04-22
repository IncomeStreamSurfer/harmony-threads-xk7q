export type CartItem = {
  product_id: string;
  qty: number;
  variant_sku?: string;
  name?: string;
  price?: number;
  image?: string;
};

const CART_KEY = "ht_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addToCart(item: CartItem): CartItem[] {
  const cart = getCart();
  const idx = cart.findIndex(i => i.product_id === item.product_id && i.variant_sku === item.variant_sku);
  if (idx >= 0) {
    cart[idx].qty += item.qty;
  } else {
    cart.push(item);
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("cart-updated", { detail: cart }));
  return cart;
}

export function removeFromCart(product_id: string, variant_sku?: string): CartItem[] {
  const cart = getCart().filter(i => !(i.product_id === product_id && i.variant_sku === variant_sku));
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("cart-updated", { detail: cart }));
  return cart;
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new CustomEvent("cart-updated", { detail: [] }));
}

export function cartTotal(cart: CartItem[]): number {
  return cart.reduce((s, i) => s + (i.price ?? 0) * i.qty, 0);
}

export async function startCheckout(items: CartItem[], email?: string) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, customer_email: email }),
  });
  const { url, error } = await res.json();
  if (error || !url) throw new Error(error ?? "Checkout failed");
  window.location.href = url;
}
