
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Retrieve the IP address from the request headers.
  // 'x-forwarded-for' is a standard header for identifying the originating IP address.
  const ip = request.headers.get('x-forwarded-for') || request.ip;

  // Log the IP address to the server-side console.
  // This will appear in your terminal where you run `npm run dev`.
  console.log(`Visitor IP: ${ip}`);

  // Continue with the user's request.
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
