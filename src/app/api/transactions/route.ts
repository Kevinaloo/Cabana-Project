import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const SESSION_TOKEN = 'cabana_session_v1_secure'

async function verifyAuth() {
  const cookieStore = await cookies()
  return cookieStore.get('cabana_auth')?.value === SESSION_TOKEN
}

// GET all transactions
export async function GET() {
  if (!await verifyAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST create transaction
export async function POST(req: NextRequest) {
  if (!await verifyAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const payload = await req.json()
    const supabase = createServiceClient()
    const { data, error } = await supabase.from('transactions').insert([payload]).select().single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Insert failed' }, { status: 500 })
  }
}

// PATCH update transaction
export async function PATCH(req: NextRequest) {
  if (!await verifyAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id, ...fields } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('transactions').update(fields).eq('id', id).select().single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Update failed' }, { status: 500 })
  }
}

// DELETE transaction
export async function DELETE(req: NextRequest) {
  if (!await verifyAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const supabase = createServiceClient()
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Delete failed' }, { status: 500 })
  }
}
