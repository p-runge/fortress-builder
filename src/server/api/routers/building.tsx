import { db } from "~/server/db";
import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { BuildingType } from "~/server/db/client";

export const BuildingSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(BuildingType),
});

export const buildingRouter = router({
  getAll: publicProcedure.output(z.array(BuildingSchema)).query(async () => {
    return await db.building.findMany();
  }),

  add: publicProcedure
    .input(z.object({ type: BuildingSchema.shape.type }))
    .mutation(async ({ input }) => {
      console.log("Adding building", input);
      return await db.building.create({
        data: {
          type: input.type,
          userId: "", // Replace with actual user ID
        },
      });
    }),
});
