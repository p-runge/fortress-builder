import { buildingRouter } from "./routers/building";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  ping: publicProcedure.query(() => "pong"),
  building: buildingRouter,
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
