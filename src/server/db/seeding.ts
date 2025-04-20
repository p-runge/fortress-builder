import { db } from ".";
import { ItemType } from "./client";

export async function seedDatabase() {
  const items = await db.item.findMany({ select: { type: true } });
  const allItemsSeeded = Object.values(ItemType).every((itemType) => {
    return items.find((item) => item.type === itemType);
  });
  if (!allItemsSeeded) {
    await seedItems();
  }
}

async function seedItems() {
  console.log("Seeding database with items...");

  await db.item.createMany({
    data: [
      {
        type: "food_boost_1000",
        cost: 10,
      },
      {
        type: "food_boost_1000000",
        cost: 10000,
      },
      {
        type: "wood_boost_1000",
        cost: 10,
      },
      {
        type: "wood_boost_1000000",
        cost: 10000,
      },
      {
        type: "stone_boost_1000",
        cost: 10,
      },
      {
        type: "stone_boost_1000000",
        cost: 10000,
      },
      {
        type: "gold_boost_1000",
        cost: 10,
      },
      {
        type: "gold_boost_1000000",
        cost: 10000,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Database successfully seeded with items!");
}
