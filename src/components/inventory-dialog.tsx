"use client";

import { faBox, faHashtag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
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
import ItemImage from "~/app/_components/item-image";

export default function InventoryDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingUse, setIsLoadingUse] = useState(false);

  const {
    data: items,
    isLoading: isLoadingItems,
    refetch: refetchUserItems,
  } = api.item.getUserItems.useQuery();

  const { mutateAsync: consumeItem } = api.item.use.useMutation();

  const router = useRouter();
  const locale = getLocale();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <FontAwesomeIcon
          icon={faBox}
          size="2x"
          className="m-2 cursor-pointer transition-transform hover:scale-110"
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Resource Items</DialogTitle>
          <DialogDescription>
            Use these items to give you an instant boost in resources.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {isLoadingItems ? (
            <div className="flex items-center justify-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : items && items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.type}
                className="flex items-center justify-between rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <ItemImage itemType={item.type} />
                <div className="grow">
                  <FontAwesomeIcon icon={faHashtag} />
                  <span className="ml-1">
                    {new Intl.NumberFormat(locale).format(item.amount)}
                  </span>
                </div>
                <Button
                  onClick={async () => {
                    if (isLoadingUse) return;
                    setIsLoadingUse(true);
                    try {
                      await consumeItem({ type: item.type, amount: 1 });
                      await refetchUserItems();
                      router.refresh();
                    } catch {}
                    setIsLoadingUse(false);
                  }}
                  className="bg-green-600 font-bold text-white"
                >
                  Activate
                </Button>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center">
              <p className="text-gray-500">No items available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
