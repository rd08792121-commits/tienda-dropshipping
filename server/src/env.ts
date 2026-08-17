import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  CHECKOUT_SUCCESS_URL: z.string().default("http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}"),
  CHECKOUT_CANCEL_URL: z.string().default("http://localhost:3000/checkout/cancel"),
  DATABASE_PATH: z.string().default("./data/store.db"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  CURRENCY: z.string().default("usd"),
});

export const env = envSchema.parse(process.env);
