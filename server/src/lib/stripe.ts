import Stripe from "stripe";
import { env } from "../env.js";
import { AppError } from "./errors.js";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new AppError(
      "STRIPE_SECRET_KEY no esta configurada. Define la variable de entorno para usar Stripe Checkout.",
      500,
    );
  }
  if (!stripeClient) {
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" });
  }
  return stripeClient;
}
