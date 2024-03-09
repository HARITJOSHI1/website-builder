import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: ["/site", "/api/uploadthing", "/api/(.*)"],
  async beforeAuth(auth, req) {},
  async afterAuth(auth, req) {
    // rewrite url for domain
    const url = req.nextUrl;
    const searchParams = url.searchParams.toString();
    let hostname = req.headers;

    const pathnameWithSearchParams = `${url.pathname}${
      searchParams.length > 0 ? `?${searchParams}` : ""
    }`;

    // if sub-domain exist
    const customSubDomain = hostname
      .get("host")
      ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
      .filter(Boolean)[0];

    if (customSubDomain)
      return NextResponse.rewrite(
        new URL(`/${customSubDomain}${pathnameWithSearchParams}`, req.url)
      );
    else if (url.pathname === "/sign-in" || url.pathname === "/sign-up") {
      return NextResponse.redirect(new URL(`/agency/sign-in`, req.url));
    } else if (
      url.pathname === "/" ||
      (url.pathname === "/site" && url.host === process.env.NEXT_PUBLIC_DOMAIN)
    ) {
      return NextResponse.rewrite(new URL("/site", req.url));
    } else if (
      url.pathname.startsWith("/agency") ||
      url.pathname.startsWith("/subaccount")
    ) {
      return NextResponse.rewrite(
        new URL(`${pathnameWithSearchParams}`, req.url)
      );
    } else NextResponse.next();
  },
});

export const config = {
  matcher: ["/(.*?trpc.*?|(?!static|.*\\..*|_next|favicon.ico).*)", "/"],
};
