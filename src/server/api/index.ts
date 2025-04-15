import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  ping: publicProcedure.query(() => "pong"),
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
