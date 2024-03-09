import "server-only";
import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;

export const redis = new Redis(process.env.UPSTASH_REDIS_URL!);

// export const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL!,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN!,
// });
