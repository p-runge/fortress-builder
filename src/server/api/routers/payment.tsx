import { z } from "zod";
import { stripe } from "~/server/payment";
import { authedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

// TODO: Replace with your app's URL
const APP_URL = "http://localhost:3000";

const GemPackageSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
});

export const paymentRouter = router({
  getGemPackages: authedProcedure
    .output(z.array(GemPackageSchema))
    .query(async () => {
      const products = await stripe.products.list({
        active: true,
        limit: 100,
      });
      const prices = await stripe.prices.list({
        active: true,
        limit: 100,
      });
      const gemPackages = products.data
        .map((product) => {
          const price = prices.data.find(
            (price) => price.product === product.id,
          );
          if (!price) {
            console.error(
              `No price found for product ${product.id} (${product.name})`,
            );
            return null;
          }

          return {
            id: product.id,
            name: product.name,
            price: price.unit_amount ? price.unit_amount / 100 : 0,
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.price - b.price);

      return gemPackages;
    }),

  buyGemPackage: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { data: prices } = await stripe.prices.list({
        product: input.id,
        active: true,
        limit: 1,
      });

      if (prices.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Price not found for the specified product.",
        });
      }

      const priceId = prices[0]!.id;
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${APP_URL}?canceled=true`,
      });

      console.log("Stripe session created:", session);

      return session.url;
    }),
});
