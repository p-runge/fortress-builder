import { db } from "~/server/db";
import { authedProcedure, router } from "../trpc";
import { z } from "zod";
import { RequestStatus } from "~/server/db/client";
import { TRPCError } from "@trpc/server";

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

  acceptContactRequest: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx: { session }, input }) => {
      const contactRequest = await db.contactRequest.findUnique({
        where: {
          id: input.id,
        },
        select: {
          fromId: true,
          toId: true,
        },
      });

      if (!contactRequest) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact request not found",
        });
      }

      if (contactRequest.toId !== session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to accept this contact request",
        });
      }

      await db.contactRequest.update({
        where: {
          id: input.id,
        },
        data: {
          status: RequestStatus.ACCEPTED,
        },
      });

      await db.user.update({
        where: {
          id: contactRequest.fromId,
        },
        data: {
          contacts: {
            connect: {
              id: session.user.id,
            },
          },
        },
      });
    }),

  rejectContactRequest: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx: { session }, input }) => {
      const contactRequest = await db.contactRequest.findUnique({
        where: {
          id: input.id,
        },
        select: {
          fromId: true,
          toId: true,
        },
      });

      if (!contactRequest) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact request not found",
        });
      }

      if (contactRequest.toId !== session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to reject this contact request",
        });
      }

      await db.contactRequest.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
