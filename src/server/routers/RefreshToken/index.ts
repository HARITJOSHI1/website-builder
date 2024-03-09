import { protectedProcedure, router } from "@/server/root";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const QueryParams = z.object({
  userId: z.string(),
});

export const RefreshTokenRouter = router({
  refresh: protectedProcedure
    .input(QueryParams)
    .query(async ({ ctx, input }) => {
      // dependencies
      const { strategy, redis, resHeaders } = ctx;
      const { userId } = input;

      try {
        const data = await redis.hget(process.env.CLERK_JWKS_URL!, userId);

        if (!data)
          return new TRPCError({
            code: "NOT_FOUND",
            message: "Couldn't find the user",
          });

        const token = await strategy.refreshToken(
          JSON.parse(data).sid,
          process.env.CLERK_JWT_TEMPLATE!
        );

        if (!token)
          return new TRPCError({
            code: "UNPROCESSABLE_CONTENT",
            message: "Couldn't generate token",
          });

        resHeaders.append("Authorization", `Bearer ${token}`);
        await redis.del(process.env.CLERK_JWKS_URL!);

        return {
          message: "Token generated successfully",
          token,
        };
      } catch (e) {
        return new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Some error occured",
        });
      }
    }),
});
