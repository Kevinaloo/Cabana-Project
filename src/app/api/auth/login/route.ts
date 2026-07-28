import { NextRequest, NextResponse } from 'next/server'

const VALID_USERNAME = 'Cabana'
const VALID_PASSWORD = 'Apatmento2026'
const SESSION_TOKEN = 'cabana_session_v1_secure'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('cabana_auth', SESSION_TOKEN, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return response
}
