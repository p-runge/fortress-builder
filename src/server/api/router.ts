import { buildingRouter } from "./routers/building";
import { itemRouter } from "./routers/item";
import { paymentRouter } from "./routers/payment";
import { resourceRouter } from "./routers/resource";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  ping: publicProcedure.query(() => "pong"),
  building: buildingRouter,
  item: itemRouter,
  payment: paymentRouter,
  resource: resourceRouter,
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
