import { z } from "zod";
import { authedProcedure, router } from "../trpc";
import { ItemType } from "~/server/db/client";
import { db } from "~/server/db";
import { TRPCError } from "@trpc/server";

const ItemSchema = z.object({
  type: z.nativeEnum(ItemType),
  cost: z.number(),
});

export const itemRouter = router({
  getShopItems: authedProcedure.output(z.array(ItemSchema)).query(async () => {
    return await db.item.findMany({
      orderBy: [
        {
          type: "asc",
        },
      ],
      select: {
        type: true,
        cost: true,
      },
    });
  }),

  buy: authedProcedure
    .input(z.object({ type: z.nativeEnum(ItemType), amount: z.number() }))
    .output(z.void())
    .mutation(async ({ input, ctx: { session } }) => {
      const item = await db.item.findUniqueOrThrow({
        where: {
          type: input.type,
        },
        select: {
          id: true,
          cost: true,
        },
      });

      const totalCost = item.cost * input.amount;
      const user = await db.user.findUniqueOrThrow({
        where: {
          id: session.user.id,
        },
        select: {
          resources: {
            select: {
              gems: true,
            },
          },
        },
      });

      if (!user.resources || user.resources.gems < totalCost) {
        throw new TRPCError({
          code: "UNPROCESSABLE_CONTENT",
          message: "Not enough gems",
        });
      }

      await db.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          resources: {
            update: {
              gems: {
                decrement: totalCost,
              },
            },
          },
          items: {
            upsert: {
              where: {
                userId_itemId: {
                  itemId: item.id,
                  userId: session.user.id,
                },
              },
              create: {
                amount: input.amount,
                itemId: item.id,
              },
              update: {
                amount: {
                  increment: input.amount,
                },
              },
            },
          },
        },
      });
    }),
});
