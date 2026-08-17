import type { Database } from "better-sqlite3";
import express, { Router } from "express";
import type Stripe from "stripe";
import { getOrderBySessionId, markOrderPaid, setOrderStatus } from "../db/orders.js";
import { decrementStock } from "../db/products.js";
import { env } from "../env.js";
import { AppError } from "../lib/errors.js";
import { getStripeClient } from "../lib/stripe.js";

export function createWebhookRouter(db: Database) {
  const router = Router();

  // Stripe firma el body crudo (sin parsear) para verificar la autenticidad del webhook,
  // por eso este router usa express.raw() en vez del express.json() global del resto de la app.
  router.post(
    "/stripe",
    express.raw({ type: "application/json" }),
    (req, res, next) => {
      if (!env.STRIPE_WEBHOOK_SECRET) {
        next(new AppError("STRIPE_WEBHOOK_SECRET no esta configurada", 500));
        return;
      }

      const signature = req.headers["stripe-signature"];
      if (!signature || typeof signature !== "string") {
        next(new AppError("Falta la cabecera stripe-signature", 400));
        return;
      }

      let event: Stripe.Event;
      try {
        const stripe = getStripeClient();
        event = stripe.webhooks.constructEvent(req.body as Buffer, signature, env.STRIPE_WEBHOOK_SECRET);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Firma invalida";
        res.status(400).json({ error: `Webhook signature verification failed: ${message}` });
        return;
      }

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const paymentIntentId =
              typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);
            markOrderPaid(db, session.id, paymentIntentId);

            const order = getOrderBySessionId(db, session.id);
            order?.items.forEach((item) => decrementStock(db, item.productId, item.quantity));
            break;
          }
          case "checkout.session.expired": {
            const session = event.data.object as Stripe.Checkout.Session;
            setOrderStatus(db, session.id, "canceled");
            break;
          }
          default:
            break;
        }
        res.json({ received: true });
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
