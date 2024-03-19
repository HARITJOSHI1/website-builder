import { updateAgencyDetails, upsertAgency } from "@/lib/queries";
import { protectedProcedure, router } from "@/server/root";
import { Agency, Plan } from "@prisma/client";
import { TRPCError } from "@trpc/server";

type QueryType = {
  update: {
    agencyId: string;
    agencyDetails: Partial<Agency>;
  };

  create: {
    agency: Agency;
    price: Plan;
  };
};

const AgencyRouter = router({
  agency: router({
    get: protectedProcedure.query(() => "Hello"),

    update: protectedProcedure
      .input((input) => input as QueryType["update"])
      .mutation(async ({ ctx, input }) => {
        const { agencyId, agencyDetails } = input;
        const { redis } = ctx;

        try {
          const res = await updateAgencyDetails(agencyId, agencyDetails);
          redis?.set(agencyId, JSON.stringify(res));

          return res;
        } catch (e) {
          return new TRPCError({
            code: "NOT_FOUND",
            message: "Couldn't find the agency",
          });
        }
      }),

    create: protectedProcedure
      .input((input) => input as QueryType["create"])
      .query(async ({ ctx, input }) => {
        const { agency, price } = input;
        const { redis } = ctx;

        try {
          const res = await upsertAgency(agency, price);
          return res;
        } catch (e) {
          return new TRPCError({
            code: "NOT_FOUND",
            message: "Couldn't find the agency",
          });
        }
      }),
  }),
});

export default AgencyRouter;
