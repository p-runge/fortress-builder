import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "~/server/db";
import { BuildingSchema, BuildingUpgradeTimes } from "~/server/models";
import { authedProcedure, router } from "../trpc";
import { buildingUpgradeQueue } from "~/server/jobs";

export const buildingRouter = router({
  getAll: authedProcedure
    .output(z.array(BuildingSchema))
    .query(async ({ ctx: { session } }) => {
      return await db.building.findMany({
        where: {
          userId: session.user.id,
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

  add: authedProcedure
    .input(z.object({ type: BuildingSchema.shape.type }))
    .output(z.string())
    .mutation(async ({ input, ctx: { session } }) => {
      const { id } = await db.building.create({
        select: {
          id: true,
        },
        data: {
          type: input.type,
          userId: session.user.id,
        },
      });

      return id;
    }),

  upgrade: authedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.void())
    .mutation(async ({ input, ctx: { session } }) => {
      const building = await db.building.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      });

      if (building.userId !== session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to upgrade this building.",
        });
      }

      if (building.upgradeStart) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Building is already upgrading.",
        });
      }

      if (building.level >= 5) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Building is already at max level.",
        });
      }

      await db.building.update({
        where: {
          id: input.id,
          userId: session.user.id,
        },
        data: {
          upgradeStart: new Date(),
        },
      });

      // start job to upgrade building after *upgradeTime* seconds
      const upgradeTime = BuildingUpgradeTimes[building.type][building.level];
      await buildingUpgradeQueue.add(
        "upgrade-building",
        { buildingId: input.id },
        { delay: upgradeTime * 1000 }
      );
    }),
});
