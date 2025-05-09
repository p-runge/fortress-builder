import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "~/server/db";
import { authedProcedure, router } from "../trpc";

const UserSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  image: z.string().nullable(),
});

export const userRouter = router({
  getContactList: authedProcedure
    .output(z.array(UserSchema))
    .query(async ({ ctx: { session } }) => {
      return db.user.findMany({
        where: {
          OR: [
            {
              contacts: {
                some: {
                  id: session.user.id,
                },
              },
            },
            {
              contactOf: {
                some: {
                  id: session.user.id,
                },
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          image: true,
        },
      });
    }),

  search: authedProcedure
    .input(
      z.object({ name: z.string().min(2), exact: z.boolean().default(false) }),
    )
    .output(z.array(UserSchema))
    .query(async ({ input }) => {
      const users = await db.user.findMany({
        where: {
          name: {
            mode: "insensitive",
            ...(input.exact
              ? {
                  equals: input.name,
                }
              : {
                  contains: input.name,
                }),
          },
        },
        select: {
          id: true,
          name: true,
          image: true,
        },
        take: 10,
      });

      return users;
    }),

  deleteContact: authedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx: { session }, input }) => {
      const user = await db.user.findUnique({
        where: {
          id: input.userId,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      await db.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          contacts: {
            disconnect: {
              id: user.id,
            },
          },
        },
      });
    }),
});
