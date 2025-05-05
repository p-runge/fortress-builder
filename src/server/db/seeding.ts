import { db } from ".";

export async function seedDatabase() {
  await seedItems();
  await seedChatRooms();
}

async function seedItems() {
  const { count } = await db.item.createMany({
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

  if (count > 0) {
    console.log("Database successfully seeded with missing items!");
  }
}

async function seedChatRooms() {
  const { count } = await db.chatRoom.createMany({
    data: [
      {
        name: "Global",
        isPublic: true,
      },
    ],
    skipDuplicates: true,
  });

  if (count > 0) {
    console.log("Database successfully seeded with missing chat rooms!");
  }
}
