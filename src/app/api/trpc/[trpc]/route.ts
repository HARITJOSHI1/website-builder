import { createContext } from "@/server/root";
import appRouter from "@/server/routers/root";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

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
      console.log('REQUEST TO PATHs:', paths);
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
