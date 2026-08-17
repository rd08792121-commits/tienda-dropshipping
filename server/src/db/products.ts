import type { Database } from "better-sqlite3";
import type { Product } from "../types.js";

type ProductRow = {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  image_url: string | null;
  stock: number;
  created_at: string;
};

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceCents: row.price_cents,
    currency: row.currency,
    imageUrl: row.image_url,
    stock: row.stock,
    createdAt: row.created_at,
  };
}

export function listProducts(db: Database): Product[] {
  const rows = db.prepare("SELECT * FROM products ORDER BY created_at ASC").all() as ProductRow[];
  return rows.map(toProduct);
}

export function getProduct(db: Database, id: string): Product | undefined {
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as ProductRow | undefined;
  return row ? toProduct(row) : undefined;
}

export function insertProduct(db: Database, product: Omit<Product, "createdAt">): Product {
  db.prepare(
    `INSERT INTO products (id, name, description, price_cents, currency, image_url, stock)
     VALUES (@id, @name, @description, @priceCents, @currency, @imageUrl, @stock)`,
  ).run(product);
  const created = getProduct(db, product.id);
  if (!created) {
    throw new Error(`Failed to insert product ${product.id}`);
  }
  return created;
}

export function decrementStock(db: Database, productId: string, quantity: number): void {
  db.prepare("UPDATE products SET stock = MAX(stock - ?, 0) WHERE id = ?").run(quantity, productId);
}
