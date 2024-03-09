import appRouter from "@/server/routers/router";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "@/server/context";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// serverless func
const handler = (req: Request) =>
  fetchRequestHandler({
    router: appRouter,
    endpoint: "/api/trpc",
    req,
    createContext,
    responseMeta(opts) {
      const { ctx, paths, errors, type, data } = opts;
      console.log("REQUEST TO PATHs:", paths);

      const allOk = errors.length === 0;
      const isQuery = type === "query";

      if (allOk && isQuery) {
        const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
        return {
          headers: {
            "cache-control": `s-maxage=1, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`,
          },
        };
      }

      return {};
    },

    onError({ error, path }) {
      console.error(`>>> tRPC Error on '${path}'`, error.message);
    },
    batching: {
      enabled: true,
    },
  });

export { handler as GET, handler as POST };
