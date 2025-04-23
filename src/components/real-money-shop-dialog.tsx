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

export default function RealMoneyShopDialog({
  trigger,
}: {
  trigger: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  // const [isLoadingBuy, setIsLoadingBuy] = useState(false);

  const { data: items, isLoading: isLoadingItems } =
    api.item.getShopItems.useQuery();

  // const { mutateAsync: buyGemPackage } = api.gemPackage.buy.useMutation();

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
          ) : items && items.length > 0 ? (
            "// TODO: List products here"
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
