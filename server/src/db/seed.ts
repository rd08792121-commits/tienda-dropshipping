import { nanoid } from "nanoid";
import { createDb } from "./index.js";
import { insertProduct, listProducts } from "./products.js";

const seedProducts = [
  {
    name: "Auriculares Inalambricos Pro",
    description: "Cancelacion de ruido activa, 30h de bateria y estuche de carga USB-C.",
    priceCents: 4999,
    currency: "usd",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    stock: 150,
  },
  {
    name: "Reloj Inteligente Fit",
    description: "Monitor de ritmo cardiaco, GPS y resistencia al agua 5ATM.",
    priceCents: 7999,
    currency: "usd",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    stock: 80,
  },
  {
    name: "Lampara LED de Escritorio",
    description: "Regulable en 5 niveles de brillo con carga inalambrica integrada.",
    priceCents: 2999,
    currency: "usd",
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c",
    stock: 200,
  },
  {
    name: "Mochila Antirrobo Impermeable",
    description: "Puerto USB de carga externo y compartimento acolchado para laptop de 15.",
    priceCents: 5499,
    currency: "usd",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
    stock: 120,
  },
];

function seed() {
  const db = createDb();
  const existing = listProducts(db);
  if (existing.length > 0) {
    console.log(`La base ya tiene ${existing.length} productos, no se vuelve a sembrar.`);
    db.close();
    return;
  }

  for (const product of seedProducts) {
    insertProduct(db, { id: nanoid(), ...product });
  }

  console.log(`Se insertaron ${seedProducts.length} productos de ejemplo.`);
  db.close();
}

seed();
