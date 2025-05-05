import { buildingRouter } from "./routers/building";
import { fortressRouter } from "./routers/fortress";
import { itemRouter } from "./routers/item";
import { paymentRouter } from "./routers/payment";
import { resourceRouter } from "./routers/resource";
import { userRouter } from "./routers/user";
import { contactRequestRouter } from "./routers/contact-request";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  ping: publicProcedure.query(() => "pong"),
  building: buildingRouter,
  contactRequest: contactRequestRouter,
  fortress: fortressRouter,
  item: itemRouter,
  payment: paymentRouter,
  resource: resourceRouter,
  user: userRouter,
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
