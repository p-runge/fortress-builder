import { NextResponse } from "next/server";
import { auth } from "./server/auth";

export async function middleware(req: Request) {
  const url = new URL(req.url);

  console.log("Middleware URL:", url.pathname);

  // Allow paths that start with "/auth"
  if (url.pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // Check the session using next-auth
  const session = await auth();

  if (!session) {
    // Redirect to the signin page if no session is found
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
