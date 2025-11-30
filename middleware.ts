import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authSession = request.cookies.get('auth_session')
  const { pathname } = request.nextUrl

  // Allow access to login page and public assets
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth') || pathname.startsWith('/_next') || pathname.includes('.')) {
    // If user is already authenticated and tries to go to login, redirect to home
    if (authSession && pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/lista-spesa', request.url))
    }
    return NextResponse.next()
  }

  // Protect all other routes
  if (!authSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
