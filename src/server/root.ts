import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { cookies } from "next/headers";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { auth } from "@clerk/nextjs";

interface AuthContext {
  clerkSessionCookie?: RequestCookie
}

export const createContextInner = async ({ clerkSessionCookie }: AuthContext) => {
  return {
    clerkSessionCookie,
  };
};

export const createContext = async (opts: FetchCreateContextFnOptions) => {

  const clerkSessionCookie = cookies().get('__session');
  return await createContextInner({
    clerkSessionCookie
  });
};

export type Context = Awaited<typeof createContext>;

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

export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  const { clerkSessionCookie } = ctx;
  const authUser = auth();

  if (!clerkSessionCookie?.value)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not allowed to access this route",
    });

  return next({
    ctx: { clerkSessionCookie, authUser },
  });
});
