import { stripe } from "~/server/payment";
import { authedProcedure, router } from "../trpc";
import { env } from "~/env";

// TODO: Replace with your app's URL
const APP_URL = "http://localhost:3000";

export const paymentRouter = router({
  createCheckoutSession: authedProcedure.mutation(async () => {
    const session = await stripe.checkout.sessions.create({
      line_items: env.STRIPE_PRODUCT_IDS.map((productId) => ({
        price: productId,
        quantity: 1,
      })),
      mode: "payment",
      success_url: `${APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}?canceled=true`,
    });

    console.log("Stripe session created:", session);

    return session.url;
  }),
});
