"use client";

import { faGem, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
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
  //hier soll für den Wert 1000 x1k und für 10000000 der Wert x1m gerendert werden und als Overlay über das Image
  return (
    <div className="relative mr-4 h-24 w-24">
      <div className="absolute inset-0">
        <Image
          width={220}
          height={220}
          src={`/resource-images/${src}.png`}
          alt={alt as string}
        />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-center text-white">
        <span className="font-bold">{item}</span>
      </div>
    </div>
  );
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
                <span>
                  {new Intl.NumberFormat(locale).format(item.cost)}
                </span>{" "}
                <FontAwesomeIcon
                  icon={faGem}
                  size="lg"
                  className="text-blue-300"
                />
                <button className="cursor-pointer rounded bg-green-600 px-4 py-2 text-orange-300">
                  Buy
                </button>
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
