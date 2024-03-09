import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { Context } from "./context";
import { createRemoteJWKSet, jwtVerify } from "jose";

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
  const { clerkSessionCookie, db, authUser } = ctx;
  const sessToken = clerkSessionCookie?.value;
  const jwksUrl = process.env.CLERK_JWKS_URL;

  try {
    const JWKS = createRemoteJWKSet(new URL(jwksUrl!));

    if (!sessToken)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not allowed to access this route",
      });

    const { payload } = await jwtVerify(sessToken, JWKS);
    console.log('PAYLOAD', payload);
    

    if (!payload)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not allowed to access this route",
      });

    return next({
      ctx: { clerkSessionCookie, db, authUser },
    });
  } 
  
  catch (e: any) {
    if (e.message.includes("exp")) {
      throw new TRPCError({
        code: e.code,
        cause: "token expired",
        message: "JWT token expired",
      });
    }
    return next();
  }
});
