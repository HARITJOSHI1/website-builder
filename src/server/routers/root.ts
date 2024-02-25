import { mergeRouters, router } from "../root";
import AgencyRouter from "./Agency";

const appRouter = mergeRouters(AgencyRouter);

export type AppRouter = typeof appRouter;
export default appRouter;
