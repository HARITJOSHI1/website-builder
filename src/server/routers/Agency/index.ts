import {
  mergeRouters,
  protectedProcedure,
  publicProcedure,
  router,
} from "@/server/root";



const AgencyRouter = router({
  fetchAgency: protectedProcedure.query(() => "Hello"),
});

export default AgencyRouter;
