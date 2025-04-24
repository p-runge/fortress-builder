import { redirect } from "next/navigation";
import { api } from "~/api/server";
import { stripe } from "~/server/payment";

export default async function VerifyPaymentPage({
  searchParams,
}: {
  searchParams: Promise<Partial<Record<"session_id", string>>>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    throw new Error("Valid session_id is required");
  }

  const { status } = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ["line_items", "payment_intent"],
  });

  if (status === "complete") {
    try {
      await api.payment.verifyPayment({
        sessionId: session_id,
      });
    } catch {}
  }

  return redirect("/");
}
