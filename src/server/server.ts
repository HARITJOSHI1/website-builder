"use server";

import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createCallerFactory } from "./root";
import appRouter from "./routers/root";

export const createAPICaller = (authToken?: RequestCookie) => {
  const createCaller = createCallerFactory(appRouter);
  return createCaller({ clerkSessionCookie: authToken });
};

