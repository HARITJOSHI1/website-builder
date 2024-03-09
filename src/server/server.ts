import "server-only";

import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createCallerFactory } from "./root";
import appRouter from "./routers/router";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";

export const createAPICaller = (authToken?: RequestCookie) => {
  const createCaller = createCallerFactory(appRouter);
  return createCaller({ clerkSessionCookie: authToken, db: db });
};
