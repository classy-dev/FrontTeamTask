import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 공개 경로 설정
  const publicPaths = ["/login", "/register"];
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // API 경로는 건너뛰기
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  // 인증이 필요한 페이지에 접근하려고 할 때
  if (!token && !isPublicPath) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // 이미 로그인한 사용자가 로그인/회원가입 페이지에 접근하려고 할 때
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|_next/data|favicon.ico).*)",
  ],
};
