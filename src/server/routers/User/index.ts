import { protectedProcedure, router } from "@/server/root";
import { TRPCError } from "@trpc/server";
import { getAuthUserDetails } from "@/lib/queries";

export const UserRouter = router({
  getUserDetails: protectedProcedure.query(async ({ ctx }) => {
    // dependencies
    const { clerkAuth } = ctx;

    try {
      const res = await getAuthUserDetails(clerkAuth?.user);
      return res;
    } catch (e) {
      return new TRPCError({
        code: "NOT_FOUND",
        message: "Couldn't find the user",
      });
    }
  }),
});
