import { NextResponse, type NextRequest } from "next/server";
import { isOpenPath, isPublicPath, routes } from "@/lib/routes";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (
    request.cookies.has("token") ||
    isPublicPath(pathname) ||
    isOpenPath(pathname)
  ) {
    return NextResponse.next();
  }
  return NextResponse.redirect(
    new URL(routes.login(pathname + search), request.url),
  );
}

export const config = {
  matcher: [
    "/((?!api/|_next/|og/|icon|apple-icon|manifest\\.webmanifest|.*\\..*).*)",
  ],
};
