import type { Database } from "better-sqlite3";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { createCartRouter } from "./routes/cart.js";
import { createCheckoutRouter } from "./routes/checkout.js";
import { createOrdersRouter } from "./routes/orders.js";
import { createProductsRouter } from "./routes/products.js";
import { createWebhookRouter } from "./routes/webhook.js";

export function createApp(db: Database) {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(morgan("dev"));

  // Debe montarse antes de express.json(): Stripe verifica la firma del
  // webhook contra el body crudo, sin parsear.
  app.use("/api/webhook", createWebhookRouter(db));

  app.use(express.json());
  app.use("/api/products", createProductsRouter(db));
  app.use("/api/cart", createCartRouter(db));
  app.use("/api/checkout", createCheckoutRouter(db));
  app.use("/api/orders", createOrdersRouter(db));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(errorHandler);

  return app;
}
