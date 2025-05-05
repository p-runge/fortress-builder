import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "~/server/db";
import { authedProcedure, router } from "../trpc";

export const chatRouter = router({
  sendMessageToUser: authedProcedure
    .input(z.object({ contactUserId: z.string().cuid(), message: z.string() }))
    .output(z.void())
    .mutation(async ({ ctx: { session }, input }) => {
      if (input.contactUserId === session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot send a message to yourself",
        });
      }

      // check if the user exists
      const user = await db.user.findUnique({
        where: {
          id: input.contactUserId,
        },
      });
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // create chat room if it doesn't exist, and add the message
      const chatRoom = await db.chatRoom.findFirst({
        where: {
          participants: {
            every: {
              id: {
                in: [session.user.id, input.contactUserId],
              },
            },
          },
        },
      });

      if (!chatRoom) {
        await db.chatRoom.create({
          data: {
            participants: {
              connect: [{ id: session.user.id }, { id: input.contactUserId }],
            },
            messages: {
              create: {
                senderId: session.user.id,
                content: input.message,
              },
            },
          },
        });
      } else {
        await db.chatRoom.update({
          where: {
            id: chatRoom.id,
          },
          data: {
            messages: {
              create: {
                senderId: session.user.id,
                content: input.message,
              },
            },
          },
        });
      }
    }),

  createChatRoom: authedProcedure
    .input(z.object({ name: z.string(), isPublic: z.boolean().optional() }))
    .output(z.string().cuid())
    .mutation(async ({ ctx: { session }, input }) => {
      const existingChatRoom = await db.chatRoom.findFirst({
        where: {
          name: input.name,
          participants: {
            some: {
              id: session.user.id,
            },
          },
        },
      });
      if (existingChatRoom) {
        throw new TRPCError({
          code: "UNPROCESSABLE_CONTENT",
          message: "Chat room with this name already exists",
        });
      }

      const chatRoom = await db.chatRoom.create({
        data: {
          name: input.name,
          isPublic: input.isPublic,
          participants: {
            connect: [{ id: session.user.id }],
          },
        },
        select: {
          id: true,
        },
      });

      return chatRoom.id;
    }),
});
