import { z } from "zod";
import { db } from "~/server/db";
import { authedProcedure, router } from "../trpc";
import { ResourceType } from "~/server/db/client";

const ResourcesSchema = z.object(
  Object.fromEntries(
    Object.keys(ResourceType).map((key) => [
      key,
      z.number().int().nonnegative(),
    ]),
  ) as Record<ResourceType, z.ZodNumber>,
);
// type Resources = z.infer<typeof ResourcesSchema>;

export const resourceRouter = router({
  getAll: authedProcedure
    .output(ResourcesSchema)
    .query(async ({ ctx: { session } }) => {
      const resources = await db.resource.findMany({
        select: {
          type: true,
          amount: true,
        },
        where: {
          userId: session.user.id,
        },
      });

      const resourcesMap = {
        ...(Object.fromEntries(
          resources.map((resource) => [resource.type, resource.amount]),
        ) as Record<ResourceType, number>),
      };

      return resourcesMap;
    }),
});
