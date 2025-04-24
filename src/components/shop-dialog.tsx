/* eslint-disable @next/next/no-img-element */
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
import { ItemType } from "~/server/db/client";

function getImageByItemType(itemType: ItemType) {
  let src;
  let alt;

  if (itemType === "food_boost_1000" || itemType === "food_boost_1000000") {
    src = "food";
    alt = "food";
  } else if (
    itemType === "wood_boost_1000" ||
    itemType === "wood_boost_1000000"
  ) {
    src = "wood";
    alt = "wood";
  } else if (
    itemType === "gold_boost_1000" ||
    itemType === "gold_boost_1000000"
  ) {
    src = "gold";
    alt = "gold";
  } else if (
    itemType === "stone_boost_1000" ||
    itemType === "stone_boost_1000000"
  ) {
    src = "stone";
    alt = "stone";
  }
  return <img src={`/resource-images/${src}.png`} alt={alt} />;
}

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
          className="m-2 cursor-pointer transition-transform hover:scale-110"
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <div className="flex justify-around">
            <DialogTitle>Resource Items</DialogTitle>
            <FontAwesomeIcon
              icon={faGem}
              className="cursor-pointer text-blue-400"
            ></FontAwesomeIcon>
          </div>
        </DialogHeader>

        {/* Wrappendes Div */}
        <div className="grid grid-cols-2 gap-4 py-4">
          {isLoadingItems ? (
            <div className="flex items-center justify-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : items && items.length > 0 ? (
            // Map Funktion
            items.map((item) => (
              <div
                key={item.type}
                className="cursor-pointer rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md"
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
                {getImageByItemType(item.type)}
                <div className="flex items-center">
                  <span>{item.type}</span>
                </div>
                <FontAwesomeIcon
                  icon={faGem}
                  size="lg"
                  className="mt-2 cursor-pointer text-blue-400"
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
