import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import { auth, signIn } from "../auth";
import { z } from "zod";
import { db } from "../db";

const SessionSchema = z
  .object({
    user: z
      .object({
        id: z.string(),
        email: z.string(),
        image: z.string().optional(),
        name: z.string(),
      })
      .strict(),
    expires: z.string(),
  })
  .strict();

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */

  const session = await auth();
  let userId;

  if (session?.user?.email) {
    const data = await db.user.findUnique({
      select: {
        id: true,
      },
      where: {
        email: session.user.email,
      },
    });
    userId = data?.id;
  }

  const parsedSession = SessionSchema.safeParse(
    session && userId
      ? {
          ...session,
          user: {
            ...session.user,
            id: userId,
          },
        }
      : null
  );
  if (!parsedSession.success) {
    console.error("Session validation failed", parsedSession.error);
    await signIn();
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Session validation failed",
    });
  }

  return {
    session: parsedSession.data,
  };
});

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<typeof createTRPCContext>().create();
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

// procedure that asserts that the user is logged in
export const authedProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts;
  const { session } = ctx;

  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return opts.next({
    ctx: {
      session,
    },
  });
});
