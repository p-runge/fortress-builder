import { db } from "~/server/db";
import { authedProcedure, router } from "../trpc";
import { z } from "zod";
import { RequestStatus } from "~/server/db/client";

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable(),
});

export const userRouter = router({
  getContactList: authedProcedure
    .output(z.array(UserSchema))
    .query(async ({ ctx: { session } }) => {
      return db.user.findMany({
        where: {
          contacts: {
            some: {
              id: session.user.id,
            },
          },
        },
        select: {
          id: true,
          name: true,
          image: true,
        },
      });
    }),

  getPendingContactRequestList: authedProcedure.query(
    async ({ ctx: { session } }) => {
      return db.contactRequest.findMany({
        where: {
          toId: session.user.id,
          status: RequestStatus.PENDING,
        },
        select: {
          id: true,
          from: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
    },
  ),
});
