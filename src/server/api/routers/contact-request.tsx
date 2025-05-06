import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "~/server/db";
import { RequestStatus } from "~/server/db/client";
import { authedProcedure, router } from "../trpc";

export const contactRequestRouter = router({
  getPendingList: authedProcedure.query(async ({ ctx: { session } }) => {
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
  }),

  create: authedProcedure
    .input(z.object({ userId: z.string() }))
    .output(z.string().cuid())
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

      if (user.id === session.user.id) {
        throw new TRPCError({
          code: "UNPROCESSABLE_CONTENT",
          message: "You cannot send a contact request to yourself",
        });
      }

      const existingRequest = await db.contactRequest.findFirst({
        where: {
          fromId: session.user.id,
          toId: user.id,
          status: RequestStatus.PENDING,
        },
      });

      if (existingRequest) {
        throw new TRPCError({
          code: "UNPROCESSABLE_CONTENT",
          message: "Contact request already sent",
        });
      }

      const contactRequest = await db.contactRequest.create({
        data: {
          fromId: session.user.id,
          toId: user.id,
          status: RequestStatus.PENDING,
        },
        select: {
          id: true,
        },
      });

      return contactRequest.id;
    }),

  accept: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx: { session }, input }) => {
      const contactRequest = await db.contactRequest.findUnique({
        where: {
          id: input.id,
        },
        select: {
          fromId: true,
          toId: true,
          status: true,
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

      if (contactRequest.status !== RequestStatus.PENDING) {
        throw new TRPCError({
          code: "UNPROCESSABLE_CONTENT",
          message: "Contact request cannot be accepted",
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

  reject: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx: { session }, input }) => {
      const contactRequest = await db.contactRequest.findUnique({
        where: {
          id: input.id,
        },
        select: {
          fromId: true,
          toId: true,
          status: true,
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

      if (contactRequest.status !== RequestStatus.PENDING) {
        throw new TRPCError({
          code: "UNPROCESSABLE_CONTENT",
          message: "Contact request cannot be rejected",
        });
      }

      await db.contactRequest.update({
        where: {
          id: input.id,
        },
        data: {
          status: RequestStatus.DECLINED,
        },
      });
    }),
});
