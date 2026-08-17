import type { Database } from "better-sqlite3";
import { nanoid } from "nanoid";
import type { Cart, CartItemWithProduct, CartWithItems } from "../types.js";
import { getProduct } from "./products.js";

type CartRow = { id: string; created_at: string };
type CartItemRow = { id: string; cart_id: string; product_id: string; quantity: number };

export function createCart(db: Database): Cart {
  const id = nanoid();
  db.prepare("INSERT INTO carts (id) VALUES (?)").run(id);
  const row = db.prepare("SELECT * FROM carts WHERE id = ?").get(id) as CartRow;
  return { id: row.id, createdAt: row.created_at };
}

export function getCart(db: Database, id: string): Cart | undefined {
  const row = db.prepare("SELECT * FROM carts WHERE id = ?").get(id) as CartRow | undefined;
  return row ? { id: row.id, createdAt: row.created_at } : undefined;
}

export function getCartWithItems(db: Database, cartId: string): CartWithItems | undefined {
  const cart = getCart(db, cartId);
  if (!cart) return undefined;

  const rows = db.prepare("SELECT * FROM cart_items WHERE cart_id = ?").all(cartId) as CartItemRow[];
  const items: CartItemWithProduct[] = rows.flatMap((row) => {
    const product = getProduct(db, row.product_id);
    if (!product) return [];
    return [{ id: row.id, cartId: row.cart_id, productId: row.product_id, quantity: row.quantity, product }];
  });

  const totalCents = items.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0);
  const currency = items[0]?.product.currency ?? "usd";

  return { ...cart, items, totalCents, currency };
}

export function addCartItem(db: Database, cartId: string, productId: string, quantity: number): void {
  const existing = db
    .prepare("SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?")
    .get(cartId, productId) as { id: string; quantity: number } | undefined;

  if (existing) {
    db.prepare("UPDATE cart_items SET quantity = ? WHERE id = ?").run(existing.quantity + quantity, existing.id);
    return;
  }

  db.prepare("INSERT INTO cart_items (id, cart_id, product_id, quantity) VALUES (?, ?, ?, ?)").run(
    nanoid(),
    cartId,
    productId,
    quantity,
  );
}

export function setCartItemQuantity(db: Database, cartId: string, productId: string, quantity: number): void {
  if (quantity <= 0) {
    removeCartItem(db, cartId, productId);
    return;
  }
  db.prepare("UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?").run(
    quantity,
    cartId,
    productId,
  );
}

export function removeCartItem(db: Database, cartId: string, productId: string): void {
  db.prepare("DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?").run(cartId, productId);
}
