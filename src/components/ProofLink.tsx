'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface Props {
  path: string
  filename: string
}

export default function ProofLink({ path, filename }: Props) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function openProof() {
    setLoading(true)
    const { data } = await supabase.storage
      .from('transaction-proofs')
      .createSignedUrl(path, 60)
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
    setLoading(false)
  }

  return (
    <button
      onClick={openProof}
      disabled={loading}
      className="text-blue-600 hover:text-blue-800 text-xs underline underline-offset-2 disabled:opacity-50"
    >
      {loading ? 'Opening...' : filename}
    </button>
  )
}
