import { db } from "~/server/db";
import { publicProcedure, router } from "../trpc";
import { z } from "zod";

const BuildingSchema = z.object({
  id: z.string(),
  type: z.enum(["townhall"]),
});

export const buildingRouter = router({
  getAll: publicProcedure.output(z.array(BuildingSchema)).query(async () => {
    return await db.building.findMany();
  }),
});
