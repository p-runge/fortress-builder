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
      const resources = await db.resource.findMany({
        where: {
          userId: session.user.id,
        },
      });

      return {
        food: resources.find((r) => r.type === ResourceType.food)?.amount ?? 0,
        wood: resources.find((r) => r.type === ResourceType.wood)?.amount ?? 0,
        stone:
          resources.find((r) => r.type === ResourceType.stone)?.amount ?? 0,
        gold: resources.find((r) => r.type === ResourceType.gold)?.amount ?? 0,
      };
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
      const resource = await db.resource.findUnique({
        where: {
          userId_type: {
            userId: session.user.id,
            type: input.type,
          },
        },
      });
      if (!resource) {
        await db.resource.create({
          data: {
            userId: session.user.id,
            type: input.type,
            amount: input.amount,
          },
        });
      } else {
        await db.resource.update({
          where: {
            id: resource.id,
          },
          data: {
            amount: resource.amount + input.amount,
          },
        });
      }
    }),
});
