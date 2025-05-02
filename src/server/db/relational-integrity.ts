import { db } from ".";
import { FORTRESS_SIZE, getCoordinatesForSize } from "../models/fortress";

export async function ensureRelationalIntegrity() {
  const users = await db.user.findMany({
    select: { id: true },
  });
  for (const user of users) {
    await ensureUserHasFortress(user.id);
  }
}

export async function ensureUserHasFortress(userId: string) {
  let fortress = await db.fortress.findUnique({
    where: { userId },
  });

  if (!fortress) {
    console.log(`Creating fortress for user ${userId}`);
    fortress = await db.fortress.create({
      data: {
        userId,
        slots: {
          createMany: {
            data: getCoordinatesForSize(FORTRESS_SIZE).map(({ x, y }) => ({
              x,
              y,
            })),
          },
        },
      },
    });
  }

  // Ensure the Fortress has the correct number of slots
  const existingSlots = await db.fortressSlot.findMany({
    where: { fortressId: fortress.id },
  });

  const requiredSlots = getCoordinatesForSize(FORTRESS_SIZE);
  if (existingSlots.length < requiredSlots.length) {
    const missingSlots = requiredSlots.filter(
      (slot) =>
        !existingSlots.some(
          (existingSlot) =>
            existingSlot.x === slot.x && existingSlot.y === slot.y,
        ),
    );
    await db.fortressSlot.createMany({
      data: missingSlots.map(({ x, y }) => ({
        fortressId: fortress.id,
        x,
        y,
      })),
    });
  }
}
