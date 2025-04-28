import Image from "next/image";
import { ItemType } from "~/server/db/client";

export default function ItemImage({ itemType }: { itemType: ItemType }) {
  let src;
  let alt;
  let amount;

  if (itemType === "food_boost_1000") {
    src = "food";
    alt = "food";
    amount = "x1k";
  } else if (itemType === "food_boost_1000000") {
    src = "food";
    alt = "food";
    amount = "x1m";
  } else if (itemType === "wood_boost_1000") {
    src = "wood";
    alt = "wood";
    amount = "x1k";
  } else if (itemType === "wood_boost_1000000") {
    src = "wood";
    alt = "wood";
    amount = "x1m";
  } else if (itemType === "gold_boost_1000") {
    src = "gold";
    alt = "gold";
    amount = "x1k";
  } else if (itemType === "gold_boost_1000000") {
    src = "gold";
    alt = "gold";
    amount = "x1m";
  } else if (itemType === "stone_boost_1000") {
    src = "stone";
    alt = "stone";
    amount = "x1k";
  } else if (itemType === "stone_boost_1000000") {
    src = "stone";
    alt = "stone";
    amount = "x1m";
  }

  return (
    <div className="relative mr-4 h-24 w-24">
      <div className="absolute inset-0">
        <Image
          width={220}
          height={220}
          src={`/resource-images/${src}.png`}
          alt={alt!}
        />
      </div>
      <div className="absolute inset-0 flex flex-col items-end justify-end p-1 text-center text-white">
        <span className="font-bold">{amount}</span>
      </div>
    </div>
  );
}
