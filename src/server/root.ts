import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const {
  createCallerFactory,
  mergeRouters,
  router,
  procedure: publicProcedure,
} = t;

export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const { db, clerkAuth, clerkSessionCookie, strategy, isRefreshing } = ctx;

  if (isRefreshing) {
    if (clerkSessionCookie)
      return next({
        ctx: { clerkSessionCookie, db, strategy },
      });

    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not allowed to access this route",
    });
  } 
  
  else if (!clerkAuth?.user)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not allowed to access this route",
    });

  return next({
    ctx: { clerkSessionCookie, db, clerkAuth, strategy },
  });
});
