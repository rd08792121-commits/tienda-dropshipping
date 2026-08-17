import { nanoid } from "nanoid";
import { createApp } from "../src/app.js";
import { createDb } from "../src/db/index.js";
import { insertProduct } from "../src/db/products.js";

export function buildTestApp() {
  const db = createDb(":memory:");

  const headphones = insertProduct(db, {
    id: nanoid(),
    name: "Auriculares Test",
    description: "Producto de prueba",
    priceCents: 2000,
    currency: "usd",
    imageUrl: null,
    stock: 10,
  });

  const lamp = insertProduct(db, {
    id: nanoid(),
    name: "Lampara Test",
    description: "Otro producto de prueba",
    priceCents: 1500,
    currency: "usd",
    imageUrl: null,
    stock: 5,
  });

  const app = createApp(db);
  return { app, db, products: { headphones, lamp } };
}
