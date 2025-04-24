"use client";

import { useState } from "react";
import { api } from "~/api/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { getLocale } from "~/i18n";
import { Button } from "./ui/button";

export default function RealMoneyShopDialog({
  trigger,
}: {
  trigger: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingBuy, setIsLoadingBuy] = useState(false);

  const { data: gemPackages, isLoading: isLoadingItems } =
    api.payment.getGemPackages.useQuery();

  const { mutateAsync: buyGemPackage } =
    api.payment.buyGemPackage.useMutation();

  const locale = getLocale();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Gem Shop</DialogTitle>
          <DialogDescription>Buy gems for real money.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 py-4">
          {isLoadingItems ? (
            <div className="flex items-center justify-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : gemPackages && gemPackages.length > 0 ? (
            gemPackages.map((gemPackage) => (
              <div
                key={gemPackage.id}
                className="flex flex-col items-center justify-center rounded-lg border p-4 shadow-sm transition-shadow duration-200 hover:shadow-md"
              >
                <h3 className="mb-2 text-2xl font-bold">{gemPackage.name}</h3>
                <p className="mb-2">
                  {Intl.NumberFormat(locale, {
                    style: "currency",
                    currency: "EUR",
                  }).format(gemPackage.price)}
                </p>
                <Button
                  disabled={isLoadingBuy}
                  onClick={async () => {
                    setIsLoadingBuy(true);
                    try {
                      const url = await buyGemPackage({
                        id: gemPackage.id,
                      });
                      if (url) {
                        window.location.href = url;
                      }
                    } catch (error) {
                      console.error("Error buying gem package:", error);
                      alert(
                        "An error occurred while processing your purchase.",
                      );
                    }
                    setIsLoadingBuy(false);
                  }}
                >
                  Buy
                </Button>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center">
              <p className="text-gray-500">No gem packages available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
