import { z } from "zod";
import { db } from "~/server/db";
import { BuildingType } from "~/server/db/client";
import { authedProcedure, router } from "../trpc";

export const BuildingSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(BuildingType),
  level: z.number().int().positive(),
});

export const buildingRouter = router({
  getAll: authedProcedure
    .output(z.array(BuildingSchema))
    .query(async ({ ctx: { session } }) => {
      return await db.building.findMany({
        where: {
          userId: session.user.id,
        },
      });
    }),

  add: authedProcedure
    .input(z.object({ type: BuildingSchema.shape.type }))
    .mutation(async ({ input, ctx: { session } }) => {
      return await db.building.create({
        data: {
          type: input.type,
          userId: session.user.id,
        },
      });
    }),

  upgrade: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx: { session } }) => {
      return await db.building.update({
        where: {
          id: input.id,
          userId: session.user.id,
        },
        data: {
          level: {
            increment: 1,
          },
        },
      });
    }),
});
