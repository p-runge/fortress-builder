"use client";

import { faGem, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "~/api/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { getLocale } from "~/i18n";
import { Button } from "./ui/button";
import ItemImage from "~/components/item-image";

export default function ShopDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingBuy, setIsLoadingBuy] = useState(false);
  const { data: resources } = api.resource.getAll.useQuery();

  const { data: items, isLoading: isLoadingItems } =
    api.item.getShopItems.useQuery();

  const { mutateAsync: buyItem } = api.item.buy.useMutation();

  const router = useRouter();
  const locale = getLocale();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <FontAwesomeIcon
          icon={faShoppingCart}
          size="2x"
          className="m-2 cursor-pointer transition-transform hover:scale-110"
        />
      </DialogTrigger>
      {resources && (
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex justify-around">
              Item Shop
              <div>
                <FontAwesomeIcon
                  icon={faGem}
                  className="cursor-pointer text-blue-400"
                ></FontAwesomeIcon>
                <span className="ml-1">
                  {new Intl.NumberFormat(locale).format(resources.gems)}
                </span>
              </div>
            </DialogTitle>
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
                    <FontAwesomeIcon
                      icon={faGem}
                      size="lg"
                      className="text-blue-400"
                    />
                    <span className="ml-1">
                      {new Intl.NumberFormat(locale).format(item.cost)}
                    </span>
                  </div>
                  <Button
                    onClick={async () => {
                      if (isLoadingBuy) return;
                      setIsLoadingBuy(true);
                      try {
                        await buyItem({ type: item.type, amount: 1 });
                        router.refresh();
                      } catch {}
                      setIsLoadingBuy(false);
                    }}
                    className="bg-green-600 font-bold text-white"
                  >
                    Buy
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
      )}
    </Dialog>
  );
}
