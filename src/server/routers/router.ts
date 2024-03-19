import { mergeRouters, router } from "../root";
import AgencyRouter from "./Agency";
import { RefreshTokenRouter } from "./RefreshToken";
import { UserRouter } from "./User";

const appRouter = router({
  v1: mergeRouters(AgencyRouter, UserRouter, RefreshTokenRouter),
});

export type AppRouter = typeof appRouter;
export default appRouter;
