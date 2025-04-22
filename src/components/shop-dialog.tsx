"use client";

import { faGem, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
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

export default function ShopDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingBuy, setIsLoadingBuy] = useState(false);

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
          className="cursor-pointer m-2 hover:scale-110 transition-transform"
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Resource Items</DialogTitle>
          <DialogDescription>
            Use these items to give you an instant boost in resources.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 py-4">
          {isLoadingItems ? (
            <div className="flex items-center justify-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : items && items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.type}
                className="cursor-pointer p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                onClick={async () => {
                  if (isLoadingBuy) return;

                  setIsLoadingBuy(true);
                  try {
                    await buyItem({ type: item.type, amount: 1 });
                    router.refresh();
                  } catch {}
                  setIsLoadingBuy(false);
                }}
              >
                <div className="flex items-center">
                  {/* <img
                    src={`/images/${item.type}.png`}
                    alt={item.type}
                    className="w-8 h-8 mr-2"
                  /> */}
                  <span>{item.type}</span>
                </div>
                <FontAwesomeIcon
                  icon={faGem}
                  size="lg"
                  className="cursor-pointer mt-2 text-blue-400"
                />{" "}
                <span>{new Intl.NumberFormat(locale).format(item.cost)}</span>
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
