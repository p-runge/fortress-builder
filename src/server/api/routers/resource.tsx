import { z } from "zod";
import { db } from "~/server/db";
import { authedProcedure, router } from "../trpc";
import { ResourceType } from "~/server/db/client";

const ResourcesSchema = z.object(
  Object.fromEntries(
    Object.keys(ResourceType).map((key) => [
      key,
      z.number().int().nonnegative(),
    ])
  ) as Record<ResourceType, z.ZodNumber>
);
// type Resources = z.infer<typeof ResourcesSchema>;

export const resourceRouter = router({
  getAll: authedProcedure
    .output(ResourcesSchema)
    .query(async ({ ctx: { session } }) => {
      const resources = await db.userResources.findUnique({
        select: {
          gems: true,
          food: true,
          wood: true,
          stone: true,
          gold: true,
        },
        where: {
          userId: session.user.id,
        },
      });

      if (resources) {
        return resources;
      }
      // if no resources found, create them
      return db.userResources.create({
        select: {
          gems: true,
          food: true,
          wood: true,
          stone: true,
          gold: true,
        },
        data: {
          userId: session.user.id,
          food: 0,
          wood: 0,
          stone: 0,
          gold: 0,
        },
      });
    }),

  add: authedProcedure
    .input(
      z.object({
        type: z.nativeEnum(ResourceType),
        amount: z.number().int().positive(),
      })
    )
    .output(z.void())
    .mutation(async ({ input, ctx: { session } }) => {
      // create or update resource for user
      const resource = await db.userResources.findUniqueOrThrow({
        where: {
          userId: session.user.id,
        },
      });

      await db.userResources.update({
        where: {
          id: resource.id,
        },
        data: {
          [input.type]: {
            increment: input.amount,
          },
        },
      });
    }),
});
