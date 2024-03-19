import { protectedProcedure, router } from "@/server/root";
import { TRPCError } from "@trpc/server";
import {
  getAuthUserDetails,
  getUserPermissions,
  initUser,
  updateUser,
} from "@/lib/queries";
import { $Enums, User } from "@prisma/client";
import { z } from "zod";

type Role = $Enums.Role;

const UserSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  avatarUrl: z.string().optional(),
  email: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  role: z
    .enum<Role, [Role, ...Role[]]>([
      "AGENCY_ADMIN",
      "AGENCY_OWNER",
      "SUBACCOUNT_GUEST",
      "SUBACCOUNT_USER",
    ])
    .optional(),
  agencyId: z.string().optional().nullable(),
});

export const UserRouter = router({
  user: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      // dependencies
      const { clerkAuth, redis } = ctx;
      if (!redis || !clerkAuth) return;

      try {
        const cachedUser = await redis.get(clerkAuth.user!.id);
        if (cachedUser) return JSON.parse(cachedUser);

        const res = await getAuthUserDetails(clerkAuth?.user);
        await redis.set(clerkAuth.user!.id, JSON.stringify(res));
        return res;
      } catch (e) {
        return new TRPCError({
          code: "NOT_FOUND",
          message: "Couldn't find the user",
        });
      }
    }),

    create: protectedProcedure
      .input(UserSchema)
      .mutation(async ({ ctx, input }) => {
        const { clerkAuth, redis } = ctx;
        if (!redis || !clerkAuth) return;

        try {
          const res = await initUser(input, clerkAuth.user);
          return res;
        } catch (e) {
          return new TRPCError({
            code: "NOT_FOUND",
            message: "Couldn't find the user",
          });
        }
      }),

    update: protectedProcedure
      .input(UserSchema)
      .mutation(async ({ ctx, input }) => {
        const { clerkAuth, redis } = ctx;
        if (!redis || !clerkAuth) return;

        try {
          const res = await updateUser(input);
          await redis.set(clerkAuth.user!.id, JSON.stringify(res));

          return res;
        } catch (e) {
          return new TRPCError({
            code: "NOT_FOUND",
            message: "Couldn't find the user",
          });
        }
      }),

    userPermissions: protectedProcedure
      .input(z.string())
      .query(async ({ ctx, input }) => {
        const { clerkAuth, redis } = ctx;
        if (!redis || !clerkAuth) return;

        try {
          const cachedPermissons = await redis.get(
            clerkAuth.user!.emailAddresses[0].emailAddress
          );

          if (cachedPermissons && JSON.parse(cachedPermissons))
            return JSON.parse(cachedPermissons);

          const res = await getUserPermissions(input);

          let userEmail: string = "";
          const permissions = res?.Permissions.filter(
            ({ access, email, id }) => {
              if (access) {
                userEmail = email;
                return true;
              }
            }
          );

          if (userEmail)
            await redis.set(userEmail, JSON.stringify(permissions));
          return res;
        } catch (e) {
          return new TRPCError({
            code: "NOT_FOUND",
            message: "Couldn't find the user",
          });
        }
      }),
  }),
});
