import { z } from "zod";
import { stripe } from "~/server/payment";
import { authedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { env } from "~/env";

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

  /**
   * This does not fully buy the package, it only creates a checkout session with
   * an url to redirect the user to.
   * After the user pays, they will be redirected to the success_url or
   * cancel_url.
   * The success_url contains the session_id, which can be used to verify the
   * payment and fulfill the order.
   */
  buyGemPackage: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx: { session } }) => {
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

      const userId = session.user.id;
      const priceId = prices[0]!.id;
      const stripeSession = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${env.APP_URL}/payment-successful/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.APP_URL}/?payment-canceled=true`,
        metadata: {
          userId,
          productId: input.id,
        },
      });

      console.log("Stripe session created:", stripeSession);

      return stripeSession.url;
    }),

  verifyPayment: authedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      const stripeSession = await stripe.checkout.sessions.retrieve(
        input.sessionId,
        {
          expand: ["line_items"],
        },
      );

      if (!stripeSession) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found.",
        });
      }

      if (stripeSession.payment_status !== "paid") {
        throw new TRPCError({
          code: "UNPROCESSABLE_CONTENT",
          message: "Payment not completed.",
        });
      }

      const userId = stripeSession.metadata?.userId;
      const productId = stripeSession.metadata?.productId;
      if (!userId || !productId) {
        console.warn(
          "⚠️ This is a very bad situation. There was a checkout session with an unknown userId or productId.",
          "So either someone spent money and we don't know who it is,",
          "or someone bought a product that we don't know about (any longer).",
        );
        // TODO: send an email to support

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User ID not found in session metadata.",
        });
      }

      // TODO: using the name is not the best way to identify the product
      // add gems to user account
      let gemsToAdd;
      const product = await stripe.products.retrieve(productId);
      if (product.name === "100 Gems") {
        gemsToAdd = 100;
      } else if (product.name === "500 Gems") {
        gemsToAdd = 500;
      }

      if (!gemsToAdd) {
        console.warn(
          "⚠️ Someone bought an unknown product. No gems were added.",
        );

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No gems to add.",
        });
      }

      await db.resource.update({
        where: { userId_type: { userId, type: "gems" } },
        data: {
          amount: {
            increment: gemsToAdd,
          },
        },
      });
    }),
});
