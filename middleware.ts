import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If it's a DB setup route, only allow if X-FOUNDER-KEY matches
    if (req.nextUrl.pathname.startsWith("/api/db")) {
      const founderKey = req.headers.get("X-FOUNDER-KEY");
      if (founderKey !== process.env.FOUNDER_KEY) {
        return new NextResponse(
          JSON.stringify({ error: "Forbidden: Founder access required." }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }
    
    // For /api/triage, ensure they are authenticated
    if (req.nextUrl.pathname.startsWith("/api/triage")) {
      if (!req.nextauth.token) {
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized. Please authenticate." }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // If it's an API route that needs protection, return true if token exists
        if (
          req.nextUrl.pathname.startsWith("/api/triage") || 
          req.nextUrl.pathname.startsWith("/api/db")
        ) {
          // We let the middleware function handle the specific logic above
          // But withAuth requires 'authorized' to be true to proceed to middleware
          // For /api/db, we don't necessarily need a token if they have the FOUNDER_KEY
          return true;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/api/triage/:path*", "/api/db/:path*"],
};
