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
        fields: {
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

  // Ensure the Fortress has the correct number of fields
  const existingFields = await db.fortressField.findMany({
    where: { fortressId: fortress.id },
  });

  const requiredFields = getCoordinatesForSize(FORTRESS_SIZE);
  if (existingFields.length < requiredFields.length) {
    const missingFields = requiredFields.filter(
      (field) =>
        !existingFields.some(
          (existingField) =>
            existingField.x === field.x && existingField.y === field.y,
        ),
    );
    await db.fortressField.createMany({
      data: missingFields.map(({ x, y }) => ({
        fortressId: fortress.id,
        x,
        y,
      })),
    });
  }
}
