import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // NextAuth speichert das Session-Token im Cookie
  const sessionToken = request.cookies.get("next-auth.session-token") || request.cookies.get("__Secure-next-auth.session-token")

  const isLoggedIn = Boolean(sessionToken)

  const publicPaths = ["/login", "/register", "/favicon.ico", "/_next", "/api/auth"]
  const isPublic = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  if (isLoggedIn && (request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register"))) {
    // Eingeloggte User dürfen nicht auf Login/Register
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
}