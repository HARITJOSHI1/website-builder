import "server-only";

import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { db, redis } from "@/lib/db";
import { PrismaClient } from "@prisma/client";
import { User } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { ClerkJWTStrategy, ClerkRedisPayload } from "./utils/ClerkJWTStrategy";
import { type Redis } from "ioredis";

interface ClerkAuthContext {
  clerkAuth?: { user?: User };
  clerkSessionCookie?: RequestCookie;
  strategy?: ClerkJWTStrategy;
  isRefreshing?: boolean;
}

interface CreateInnerContext {
  clerkSessionCookie?: RequestCookie;
  req?: Request;
  resHeaders?: Headers;
}

interface InnerContextReturnType extends ClerkAuthContext {
  db: PrismaClient;
  redis?: Redis;
  resHeaders?: Headers;
}

export const createContextInner = async ({
  clerkSessionCookie,
  req,
  resHeaders,
}: CreateInnerContext): Promise<InnerContextReturnType> => {
  const sessToken = clerkSessionCookie?.value!;
  const jwksUrl = process.env.CLERK_JWKS_URL!;
  const bearerToken = process.env.CLERK_SECRET_KEY!;
  const clerkBEUrL = process.env.CLERK_BACKEND_URL!;

  const strategy = new ClerkJWTStrategy(sessToken, jwksUrl, clerkBEUrL, redis);

  if (req?.url.includes("refresh"))
    return {
      clerkSessionCookie,
      db,
      redis,
      strategy,
      clerkAuth: { user: undefined },
      isRefreshing: true,
      resHeaders,
    };

  try {
    const payload = await strategy.startPayloadVerification();

    const cachedUser = await redis.hget(
      process.env.CLERK_JWKS_URL!,
      payload.sub!
    );

    const user = cachedUser
      ? (JSON.parse(cachedUser).user as User)
      : await strategy.getUser(payload, bearerToken);

    return {
      clerkSessionCookie,
      db,
      redis,
      clerkAuth: { user },
      strategy,
      resHeaders,
    };
  } catch (e) {
    const error = e as TRPCError;
    if (error.name === "JWTExpired") {
      throw new TRPCError({
        code: "PARSE_ERROR",
        cause: "Expired",
        message: "Token is expired need refresh",
      });
    }

    throw new TRPCError({
      code: error.code,
      cause: error.cause,
      message: error.message,
    });
  }
};

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const clerkSessionCookie = cookies().get("__session");
  const innerContext = await createContextInner({
    clerkSessionCookie,
    req: opts.req,
    resHeaders: opts.resHeaders,
  });

  return {
    ...innerContext,
  };
};

export type Context = Awaited<typeof createContext>;
