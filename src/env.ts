import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    DISCORD_CLIENT_ID: z.string().min(1),
    DISCORD_CLIENT_SECRET: z.string().min(1),
    REDIS_URL: z.string().url(),
    STRIPE_SECRET_KEY: z.string().min(1),
    // transform to array
    STRIPE_PRODUCT_IDS: z
      .string()
      .min(1)
      .transform((val) => {
        val = val.trim();
        if (val.length === 0) {
          return [];
        }
        return val.split(",").map((id) => id.trim());
      }),
    DEV_SLOW_CONNECTION: z
      .string()
      .optional()
      .transform((val) => {
        // never allow this outside of development
        if (process.env.NODE_ENV !== "development") {
          return false;
        }

        return val === "true";
      }),
  },
  client: {
    // NEXT_PUBLIC_PUBLISHABLE_KEY: z.string().min(1),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    REDIS_URL: process.env.REDIS_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_PRODUCT_IDS: process.env.STRIPE_PRODUCT_IDS,
    DEV_SLOW_CONNECTION: process.env.DEV_SLOW_CONNECTION,
    // NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  },
});
