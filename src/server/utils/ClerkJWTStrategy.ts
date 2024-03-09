import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { TRPCError } from "@trpc/server";
import { User } from "@clerk/nextjs/server";
import { convertResponse } from "@/lib/snakeCaseToCamel";
import axios from "axios";
import clerk from "@clerk/clerk-sdk-node";
import { type Redis } from "ioredis";

export type ClerkRedisPayload = { user: User; sid: string };

export class ClerkJWTStrategy {
  constructor(
    private sessToken: string,
    private jwksUrl: string,
    private backendUrl: string,
    private redis: Redis
  ) {
    if (!sessToken)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No session token provided Request denied",
      });
  }

  private generateJWKSSet = () => createRemoteJWKSet(new URL(this.jwksUrl));

  checkSession = () => {
    if (!this.sessToken)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No session token provided Request denied",
      });
  };

  startPayloadVerification = async () => {
    const { payload } = await jwtVerify(this.sessToken, this.generateJWKSSet());
    const currentTimestamp = new Date().getTime() / 1000;

    if (!payload) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Payload verification failed",
      });
    } else if (payload?.exp && currentTimestamp > payload?.exp)
      throw new TRPCError({
        code: "PARSE_ERROR",
        cause: "TOKEN EXPIRED",
        message: "Session token expired, refresh token",
      });

    return payload;
  };

  getUser = async (payload: JWTPayload, token: string) => {
    const response = await axios.get<User[]>(`${this.backendUrl}/users`, {
      params: {
        user_id: payload.sub,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    const user = convertResponse(response.data[0]);
    await this.redis.hset(
      process.env.CLERK_JWKS_URL!,
      { [user.id]: JSON.stringify({ user, sid: payload.sid }) }
    );

    return user;
  };

  refreshToken = async (sid: string, template: string) => {
    const jwtToken = (await clerk.sessions.getToken(sid, template)) as string;

    return jwtToken;
  };
}
