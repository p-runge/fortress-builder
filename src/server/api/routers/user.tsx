import { db } from "~/server/db";
import { authedProcedure, router } from "../trpc";
import { z } from "zod";

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
});
