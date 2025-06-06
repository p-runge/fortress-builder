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
import { Skeleton } from "./ui/skeleton";

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
            <LoadingState />
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
                    } catch {}
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

function LoadingState() {
  return Array.from({ length: 5 }).map((_, index) => (
    <div
      key={index}
      className="flex flex-col items-center justify-center rounded-lg border p-4"
    >
      <Skeleton className="h-8 w-32 rounded-lg" />
      <Skeleton className="mt-2 h-6 w-24 rounded-lg" />
      <Skeleton className="mt-2 h-10 w-20 rounded-lg" />
    </div>
  ));
}
