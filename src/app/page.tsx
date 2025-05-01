import UI from "~/components/ui";
import Fortress from "./_components/fortress";
import { OverlayProvider } from "./_components/overlay-provider";

// type AppRouterPage<T extends string> = (props: {
//   searchParams: Promise<Partial<Record<T, string>>>;
// }) => JSX.Element;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Partial<Record<"payment-canceled", string>>>;
}) {
  const sp = await searchParams;
  const paymentCanceled = sp["payment-canceled"] !== undefined;

  if (paymentCanceled) {
    console.log("Payment canceled");

    // TODO: trigger a toast
  }

  return (
    <UI>
      <main className="flex h-full items-center justify-center">
        <OverlayProvider>
          <Fortress />
        </OverlayProvider>
      </main>
    </UI>
  );
}
