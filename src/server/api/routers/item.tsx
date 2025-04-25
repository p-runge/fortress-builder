import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "~/server/db";
import { ItemType } from "~/server/db/client";
import { authedProcedure, router } from "../trpc";

const ShopItemSchema = z.object({
  type: z.nativeEnum(ItemType),
  cost: z.number(),
});

const UserItemSchema = z.object({
  type: z.nativeEnum(ItemType),
  amount: z.number(),
});

export const itemRouter = router({
  getShopItems: authedProcedure
    .output(z.array(ShopItemSchema))
    .query(async () => {
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
              amount: true,
            },
            where: {
              type: "gems",
            },
          },
        },
      });

      if (!user.resources || (user.resources[0]?.amount ?? 0) < totalCost) {
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
              where: {
                userId_type: {
                  type: "gems",
                  userId: session.user.id,
                },
              },
              data: {
                amount: {
                  decrement: totalCost,
                },
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

  getUserItems: authedProcedure
    .output(z.array(UserItemSchema))
    .query(async ({ ctx: { session } }) => {
      const items = await db.userItems.findMany({
        where: {
          userId: session.user.id,
          amount: {
            gt: 0,
          },
        },
        select: {
          item: {
            select: {
              type: true,
            },
          },
          amount: true,
        },
        orderBy: [
          {
            item: {
              type: "asc",
            },
          },
        ],
      });

      return items.map((item) => ({
        type: item.item.type,
        amount: item.amount,
      }));
    }),

  use: authedProcedure
    .input(
      z.object({ type: z.nativeEnum(ItemType), amount: z.number().default(1) }),
    )
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

      // TODO: add rollback in case of error

      // trigger item effect
      await itemEffectMap[input.type](session.user.id, input.amount);

      // remove user item
      await db.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          items: {
            update: {
              where: {
                userId_itemId: {
                  itemId: item.id,
                  userId: session.user.id,
                },
              },
              data: {
                amount: {
                  decrement: input.amount,
                },
              },
            },
          },
        },
      });
    }),
});

/**
 * Each item type has a corresponding effect that is triggered when the item is used.
 */
const itemEffectMap: Record<
  ItemType,
  (userId: string, amount: number) => Promise<void>
> = {
  [ItemType.food_boost_1000]: async function (userId, amount) {
    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        resources: {
          update: {
            where: {
              userId_type: {
                type: "food",
                userId,
              },
            },
            data: {
              amount: {
                increment: 1000 * amount,
              },
            },
          },
        },
      },
    });
  },
  [ItemType.food_boost_1000000]: async function (userId, amount) {
    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        resources: {
          update: {
            where: {
              userId_type: {
                type: "food",
                userId,
              },
            },
            data: {
              amount: {
                increment: 1000000 * amount,
              },
            },
          },
        },
      },
    });
  },
  [ItemType.wood_boost_1000]: async function (userId, amount) {
    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        resources: {
          update: {
            where: {
              userId_type: {
                type: "wood",
                userId,
              },
            },
            data: {
              amount: {
                increment: 1000 * amount,
              },
            },
          },
        },
      },
    });
  },
  [ItemType.wood_boost_1000000]: async function (userId, amount) {
    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        resources: {
          update: {
            where: {
              userId_type: {
                type: "wood",
                userId,
              },
            },
            data: {
              amount: {
                increment: 1000000 * amount,
              },
            },
          },
        },
      },
    });
  },
  [ItemType.stone_boost_1000]: async function (userId, amount) {
    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        resources: {
          update: {
            where: {
              userId_type: {
                type: "stone",
                userId,
              },
            },
            data: {
              amount: {
                increment: 1000 * amount,
              },
            },
          },
        },
      },
    });
  },
  [ItemType.stone_boost_1000000]: async function (userId, amount) {
    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        resources: {
          update: {
            where: {
              userId_type: {
                type: "stone",
                userId,
              },
            },
            data: {
              amount: {
                increment: 1000000 * amount,
              },
            },
          },
        },
      },
    });
  },
  [ItemType.gold_boost_1000]: async function (userId, amount) {
    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        resources: {
          update: {
            where: {
              userId_type: {
                type: "gold",
                userId,
              },
            },
            data: {
              amount: {
                increment: 1000 * amount,
              },
            },
          },
        },
      },
    });
  },
  [ItemType.gold_boost_1000000]: async function (userId, amount) {
    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        resources: {
          update: {
            where: {
              userId_type: {
                type: "gold",
                userId,
              },
            },
            data: {
              amount: {
                increment: 1000000 * amount,
              },
            },
          },
        },
      },
    });
  },
};
