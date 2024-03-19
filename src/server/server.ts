import "server-only";

import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createCallerFactory } from "./root";
import appRouter from "./routers/router";
import { db, redis } from "@/lib/db";

export const createAPICaller = (cookie?: RequestCookie) => {
  const createCaller = createCallerFactory(appRouter);
  return createCaller({ clerkSessionCookie: cookie, db: db, redis: redis });
};
