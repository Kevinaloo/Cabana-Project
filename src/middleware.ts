import { NextResponse, type NextRequest } from 'next/server'

const SESSION_TOKEN = 'cabana_session_v1_secure'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authCookie = request.cookies.get('cabana_auth')?.value
  const isAuthed = authCookie === SESSION_TOKEN

  // Skip auth routes and API
  if (pathname.startsWith('/auth') || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users to login
  if (!isAuthed && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from login
  if (isAuthed && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
