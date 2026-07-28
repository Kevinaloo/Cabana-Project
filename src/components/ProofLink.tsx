'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface Props { path: string; filename: string }

export default function ProofLink({ path, filename }: Props) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function openProof() {
    setLoading(true)
    // Since bucket is public, just construct the public URL
    const { data } = supabase.storage.from('finance-proofs').getPublicUrl(path)
    if (data?.publicUrl) window.open(data.publicUrl, '_blank')
    setLoading(false)
  }

  return (
    <button onClick={openProof} disabled={loading} style={{
      color: '#10b981', fontSize: 12, background: 'none', border: 'none',
      cursor: 'pointer', textDecoration: 'underline', opacity: loading ? 0.5 : 1,
      padding: 0,
    }}>
      {loading ? 'Opening…' : filename}
    </button>
  )
}
