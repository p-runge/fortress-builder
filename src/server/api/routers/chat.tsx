import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "~/server/db";
import { authedProcedure, router } from "../trpc";

const ChatRoomSchema = z.object({
  id: z.string().cuid(),
  name: z.string().nullable(),
  isPublic: z.boolean(),
  participants: z.array(
    z.object({
      id: z.string().cuid(),
      name: z.string(),
      image: z.string().nullable(),
    }),
  ),
  messages: z.array(
    z.object({
      id: z.string().cuid(),
      content: z.string(),
      createdAt: z.date(),
      sender: z.object({
        id: z.string().cuid(),
        name: z.string(),
        image: z.string().nullable(),
      }),
    }),
  ),
});

export const chatRouter = router({
  getChatRoomByName: authedProcedure
    .input(z.object({ name: z.string() }))
    .output(ChatRoomSchema)
    .query(async ({ input, ctx: { session } }) => {
      const chatRoom = await db.chatRoom.findUnique({
        where: {
          name: input.name,
        },
        select: {
          id: true,
          name: true,
          isPublic: true,
          participants: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          messages: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              sender: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });
      if (!chatRoom) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat room not found",
        });
      }
      if (!chatRoom.isPublic) {
        const isParticipant = chatRoom.participants.some(
          (user) => user.id === session.user.id,
        );
        if (!isParticipant) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not a participant of this chat room",
          });
        }
      } else {
        const isParticipant = chatRoom.participants.some(
          (user) => user.id === session.user.id,
        );
        if (!isParticipant) {
          throw new TRPCError({
            code: "UNPROCESSABLE_CONTENT",
            message: "You must join the chat room to get messages",
          });
        }
      }

      return chatRoom;
    }),

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

  addUsersToChatRoom: authedProcedure
    .input(
      z.object({
        chatRoomId: z.string().cuid(),
        userIds: z.array(z.string().cuid()),
      }),
    )
    .output(z.void())
    .mutation(async ({ ctx: { session }, input }) => {
      const chatRoom = await db.chatRoom.findUnique({
        where: {
          id: input.chatRoomId,
        },
        select: {
          isPublic: true,
          participants: {
            select: {
              id: true,
            },
          },
        },
      });
      if (!chatRoom) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat room not found",
        });
      }
      if (chatRoom.isPublic) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Users cannot be added to public chat rooms",
        });
      }

      if (chatRoom.participants.some((user) => user.id === session.user.id)) {
        await db.chatRoom.update({
          where: {
            id: input.chatRoomId,
          },
          data: {
            participants: {
              connect: input.userIds.map((userId) => ({ id: userId })),
            },
          },
        });
      } else {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a participant of this chat room",
        });
      }
    }),

  joinChatRoom: authedProcedure
    .input(z.object({ name: z.string() }))
    .output(z.void())
    .mutation(async ({ ctx: { session }, input }) => {
      const chatRoom = await db.chatRoom.findUnique({
        where: {
          name: input.name,
        },
        select: {
          isPublic: true,
          participants: {
            select: {
              id: true,
            },
          },
        },
      });
      if (!chatRoom) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat room not found",
        });
      }
      if (!chatRoom.isPublic) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot join a private chat room",
        });
      }

      if (chatRoom.participants.some((user) => user.id === session.user.id)) {
        throw new TRPCError({
          code: "UNPROCESSABLE_CONTENT",
          message: "You are already a participant of this chat room",
        });
      }

      await db.chatRoom.update({
        where: {
          name: input.name,
        },
        data: {
          participants: {
            connect: { id: session.user.id },
          },
        },
      });
    }),
});
