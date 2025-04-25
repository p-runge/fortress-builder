import { TRPCError } from "@trpc/server";
import { on } from "stream";
import { z } from "zod";
import { eventEmitter } from "~/server/api/event-emitter";
import { db } from "~/server/db";
import { ResourceType } from "~/server/db/client";
import { jobQueue } from "~/server/jobs/job-queue";
import { BuildingMetric, BuildingSchema } from "~/server/models/building";
import { authedProcedure, router } from "../trpc";

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

  build: authedProcedure
    .input(z.object({ type: BuildingSchema.shape.type }))
    .output(z.string())
    .mutation(async ({ input, ctx: { session } }) => {
      const resources = await db.resource.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          type: true,
          amount: true,
        },
      });

      const costs = BuildingMetric[input.type].upgrades[1]?.costs ?? {};
      for (const [resource, cost] of Object.entries(costs)) {
        if ((resources.find((r) => r.type === resource)?.amount ?? 0) < cost) {
          throw new TRPCError({
            code: "UNPROCESSABLE_CONTENT",
            message: `Not enough ${resource} to build building.`,
          });
        }
      }

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

  startUpgrade: authedProcedure
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

      // check if user has enough resources to upgrade building
      const costs =
        BuildingMetric[building.type].upgrades[building.level + 1]?.costs;
      if (costs) {
        const user = await db.user.findUniqueOrThrow({
          where: {
            id: session.user.id,
          },
          select: {
            resources: true,
          },
        });
        for (const [resource, cost] of Object.entries(costs)) {
          if (
            user.resources!.find((r) => r.type === resource)?.amount ??
            0 < cost
          ) {
            throw new TRPCError({
              code: "UNPROCESSABLE_CONTENT",
              message: `Not enough ${resource} to upgrade building.`,
            });
          }
        }

        // remove costs from user resources
        await db.user.update({
          where: {
            id: session.user.id,
          },
          data: {
            resources: {
              updateMany: Object.entries(costs).map(([resource, cost]) => ({
                where: {
                  userId: session.user.id,
                  resource: resource as ResourceType, // type assertion
                },
                data: {
                  amount: {
                    decrement: cost, // decrement the resource amount
                  },
                },
              })),
            },
          },
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
      const upgradeTime =
        BuildingMetric[building.type].upgrades[building.level + 1]?.time ?? 0;
      await jobQueue.addJob(
        "upgrade-building",
        { buildingId: input.id },
        upgradeTime * 1000,
      );
    }),

  onUpgrade: authedProcedure
    .input(z.object({ id: z.string() }))
    .subscription(async function* ({ input, signal, ctx: { session } }) {
      console.log("Subscribing to upgrading of building with ID:", input.id);
      const building = await db.building.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      });
      if (building.userId !== session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to subscribe to this building.",
        });
      }

      while (true) {
        console.log("Waiting for building upgrade event...");
        // listen for new events
        const iterator = on(eventEmitter, "upgrade-building", {
          signal,
        });
        try {
          for await (const iteration of iterator) {
            console.log(
              "Received event for building upgrade, iteration:",
              iteration,
            );
            const { id, level } = iteration[0] as { id: string; level: number };
            if (id !== input.id) {
              continue;
            }

            yield {
              level,
            };
          }
        } catch (error) {
          console.error("Error in building upgrade subscription:", error);
          break;
        }
      }
    }),
});
