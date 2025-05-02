import { z } from "zod";
import { db } from "~/server/db";
import { BuildingWithCollectableBuildingSchema } from "~/server/models/building";
import { authedProcedure, router } from "../trpc";

const FortressFieldSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  building: BuildingWithCollectableBuildingSchema.nullable(),
});
export type FortressField = z.infer<typeof FortressFieldSchema>;

export const fortressRouter = router({
  getAllFields: authedProcedure
    .output(z.array(FortressFieldSchema))
    .query(async ({ ctx: { session } }) => {
      return await db.fortressField.findMany({
        where: {
          fortress: {
            userId: session.user.id,
          },
        },
        select: {
          id: true,
          x: true,
          y: true,
          building: {
            select: {
              id: true,
              type: true,
              level: true,
              upgradeStart: true,
              collectableBuilding: {
                select: {
                  id: true,
                  lastCollected: true,
                  resourceType: true,
                },
              },
            },
          },
        },
        orderBy: [
          {
            createdAt: "asc",
          },
          {
            id: "asc",
          },
        ],
      });
    }),
});
