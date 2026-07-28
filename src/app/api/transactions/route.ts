import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const SESSION_TOKEN = 'cabana_session_v1_secure'

export async function POST(req: NextRequest) {
  // Verify the user is authenticated via cookie
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('cabana_auth')?.value
  if (authCookie !== SESSION_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await req.json()
    const supabase = createServiceClient()
    const { error } = await supabase.from('transactions').insert([payload])
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Insert failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
