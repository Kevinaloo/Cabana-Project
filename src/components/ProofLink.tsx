'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface Props { path: string; filename: string }

export default function ProofLink({ path, filename }: Props) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function openProof() {
    setLoading(true)
    const { data, error } = await supabase.storage
      .from('transaction-proofs')
      .createSignedUrl(path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    else if (error) console.error('Failed to open proof:', error.message)
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
