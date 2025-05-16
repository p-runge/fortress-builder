import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "~/server/db";
import { authedProcedure, router } from "../trpc";
import { eventEmitter } from "~/server/jobs/event-emitter";
import { on } from "stream";

export const ChatRoomSchema = z.object({
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
export type ChatRoom = z.infer<typeof ChatRoomSchema>;

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
            // sort descending to get the latest messages first when limiting with take
            orderBy: {
              createdAt: "desc",
            },
            take: 25,
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

      /**
       * reverse the messages to get the latest messages at the bottom although
       * sorting descending in the db query
       */
      chatRoom.messages.reverse();

      return chatRoom;
    }),

  getPrivateChatRoomWithUser: authedProcedure
    .input(z.object({ userId: z.string().cuid() }))
    .output(ChatRoomSchema)
    .query(async ({ input, ctx: { session } }) => {
      // check if the user exists
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

      // check if users are contacts
      const isContact = await db.user.findFirst({
        where: {
          id: session.user.id,
          OR: [
            {
              contacts: {
                some: {
                  id: input.userId,
                },
              },
            },
            {
              contactOf: {
                some: {
                  id: input.userId,
                },
              },
            },
          ],
        },
      });
      if (!isContact) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only chat with your contacts",
        });
      }

      let chatRoom = await db.chatRoom.findFirst({
        where: {
          // only get direct messages between 2 users
          isPublic: false,
          name: null,
          // only get chat rooms where the 2 users are the only participants
          participants: {
            none: {
              id: {
                not: {
                  in: [session.user.id, input.userId],
                },
              },
            },
          },
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
            orderBy: {
              createdAt: "desc",
            },
            take: 25,
          },
        },
      });

      if (!chatRoom) {
        chatRoom = await db.chatRoom.create({
          data: {
            name: null,
            isPublic: false,
            participants: {
              connect: [{ id: session.user.id }, { id: input.userId }],
            },
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
              orderBy: {
                createdAt: "desc",
              },
              take: 25,
            },
          },
        });
      }

      return chatRoom;
    }),

  subscribeToChatRoom: authedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .subscription(async function* ({ input, ctx: { session }, signal }) {
      const chatRoom = await db.chatRoom.findUnique({
        where: { id: input.id },
        select: {
          id: true,
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

      const isParticipant = chatRoom.participants.some(
        (user) => user.id === session.user.id,
      );
      if (!isParticipant) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a participant of this chat room",
        });
      }

      while (true) {
        console.log("Waiting for incoming chat message...");
        // listen for new events
        const iterator = on(
          eventEmitter,
          `send-message-in-chat-room-${chatRoom.id}`,
          {
            signal,
          },
        );
        try {
          for await (const iteration of iterator) {
            console.log(
              `Received a new message for that room ${chatRoom.id}, iteration:`,
              iteration,
            );
            const { message } = iteration[0] as {
              message: {
                id: string;
                content: string;
                createdAt: Date;
                sender: {
                  id: string;
                  name: string;
                  image: string | null;
                };
              };
            };

            yield {
              message,
            };
          }
        } catch (error) {
          console.error("Error in building upgrade subscription:", error);
          break;
        }
      }
    }),

  sendMessageToChatRoom: authedProcedure
    .input(z.object({ id: z.string(), message: z.string() }))
    .output(z.void())
    .mutation(async ({ input, ctx: { session } }) => {
      const chatRoom = await db.chatRoom.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          isPublic: true,
          participants: true,
        },
      });
      if (!chatRoom) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat room not found",
        });
      }

      const isParticipant = chatRoom.participants.some(
        (user) => user.id === session.user.id,
      );
      if (!isParticipant) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a participant of this chat room",
        });
      }

      const newMessage = await db.message.create({
        data: {
          content: input.message,
          roomId: chatRoom.id,
          senderId: session.user.id,
        },
      });

      // emit the event to all participants of the chat room
      eventEmitter.emit(`send-message-in-chat-room-${chatRoom.id}`, {
        message: {
          id: newMessage.id,
          content: input.message,
          createdAt: newMessage.createdAt,
          sender: {
            id: session.user.id,
            name: session.user.name,
            image: session.user.image,
          },
        },
      });
    }),

  createChatRoom: authedProcedure
    .input(z.object({ name: z.string(), isPublic: z.boolean().optional() }))
    .output(z.string().cuid())
    .mutation(async ({ ctx: { session }, input }) => {
      const existingChatRoom = await db.chatRoom.findFirst({
        where: {
          name: input.name,
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
