'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { TransactionType } from '@/types'

const MONEY_IN_METHODS  = ['M-Pesa','Bank Transfer','Cash','Cheque','Crypto','Other']
const MONEY_OUT_CATS    = ['Salaries & Payroll','Rent & Office','Marketing & Ads','Technology & Software','Travel & Transport','Legal & Compliance','Equipment & Hardware','Utilities','Operations','Other']

const inp: React.CSSProperties = {
  width:'100%', background:'rgba(10,16,32,0.85)', backdropFilter:'blur(8px)',
  border:'1.5px solid rgba(255,255,255,0.08)', borderRadius:12,
  padding:'12px 14px', fontSize:14, color:'#f0f6ff', outline:'none',
  fontFamily:'Inter,sans-serif', transition:'border-color 0.18s, box-shadow 0.18s',
  boxSizing:'border-box',
}

interface Props { type: TransactionType }

export default function TransactionForm({ type }: Props) {
  const router  = useRouter()
  const supabase = createClient()
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)
  const [error, setError]         = useState('')
  const [proofFile, setProofFile] = useState<File|null>(null)
  const [dragOver, setDragOver]   = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    payment_method: 'M-Pesa',
    reference_number: '',
    category: 'Operations',
    project_purpose: '',
    description: '',
    notes: '',
  })

  const set = (k:string, v:string) => setForm(p => ({...p,[k]:v}))
  const isIn = type === 'money_in'
  const accent = isIn ? 'var(--green)' : 'var(--red)'
  const accentDim = isIn ? 'rgba(14,207,142,0.1)' : 'rgba(255,107,138,0.08)'
  const accentBorder = isIn ? 'rgba(14,207,142,0.22)' : 'rgba(255,107,138,0.2)'

  function focusGreen(e: React.FocusEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) {
    e.target.style.borderColor = isIn ? 'var(--green)' : 'var(--red)'
    e.target.style.boxShadow   = isIn ? '0 0 0 3px rgba(14,207,142,0.14)' : '0 0 0 3px rgba(255,107,138,0.14)'
  }
  function blurReset(e: React.FocusEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) {
    e.target.style.borderColor = 'rgba(255,255,255,0.08)'
    e.target.style.boxShadow   = 'none'
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) setProofFile(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      let proof_url = null, proof_filename = null
      if (proofFile) {
        const ext = proofFile.name.split('.').pop()
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { data: up, error: ue } = await supabase.storage.from('transaction-proofs').upload(filename, proofFile)
        if (ue) throw new Error('Proof upload failed: ' + ue.message)
        proof_url = up.path; proof_filename = proofFile.name
      }
      const payload: Record<string,unknown> = {
        type, date:form.date, amount:parseFloat(form.amount),
        description:form.description||null, notes:form.notes||null,
        proof_url, proof_filename, created_by:'cabana-admin',
      }
      if (isIn) { payload.payment_method=form.payment_method; payload.reference_number=form.reference_number||null }
      else       { payload.category=form.category; payload.project_purpose=form.project_purpose||null }

      const res = await fetch('/api/transactions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
      const body = await res.json()
      if (!res.ok) throw new Error(body.error||'Insert failed')
      setSuccess(true)
      setTimeout(()=>{ router.push('/transactions'); router.refresh() }, 1400)
    } catch(e:unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>

      {/* Date + Amount */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }} className="form-2col">
        <div>
          <label style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:8 }}>Date *</label>
          <input type="date" required value={form.date} onChange={e=>set('date',e.target.value)}
            style={inp} onFocus={focusGreen} onBlur={blurReset} />
        </div>
        <div>
          <label style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:8 }}>Amount (KES) *</label>
          <input type="number" required min="1" step="0.01" value={form.amount} onChange={e=>set('amount',e.target.value)}
            placeholder="0.00" style={inp} onFocus={focusGreen} onBlur={blurReset} />
        </div>
      </div>

      {/* Type-specific */}
      {isIn ? (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }} className="form-2col">
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:8 }}>Payment Method *</label>
            <select value={form.payment_method} onChange={e=>set('payment_method',e.target.value)}
              style={inp} onFocus={focusGreen} onBlur={blurReset}>
              {MONEY_IN_METHODS.map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:8 }}>Reference Number</label>
            <input type="text" value={form.reference_number} onChange={e=>set('reference_number',e.target.value)}
              placeholder="e.g. QAB1234XYZ" style={inp} onFocus={focusGreen} onBlur={blurReset} />
          </div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }} className="form-2col">
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:8 }}>Category *</label>
            <select value={form.category} onChange={e=>set('category',e.target.value)}
              style={inp} onFocus={focusGreen} onBlur={blurReset}>
              {MONEY_OUT_CATS.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:8 }}>Project / Purpose</label>
            <input type="text" value={form.project_purpose} onChange={e=>set('project_purpose',e.target.value)}
              placeholder="e.g. Website development" style={inp} onFocus={focusGreen} onBlur={blurReset} />
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <label style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:8 }}>Description</label>
        <input type="text" value={form.description} onChange={e=>set('description',e.target.value)}
          placeholder={isIn ? 'e.g. Seed round — Tranche 1' : 'e.g. Monthly AWS cloud bill — Jul 2026'}
          style={inp} onFocus={focusGreen} onBlur={blurReset} />
      </div>

      {/* Notes */}
      <div>
        <label style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:8 }}>Notes</label>
        <textarea value={form.notes} onChange={e=>set('notes',e.target.value)} rows={3}
          placeholder="Any additional context or remarks…"
          style={{ ...inp, resize:'none', fontFamily:'Inter,sans-serif' } as React.CSSProperties}
          onFocus={focusGreen} onBlur={blurReset} />
      </div>

      {/* Proof Upload — drag & drop */}
      <div>
        <label style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:8 }}>
          Upload Proof {isIn ? '(Receipt / Bank slip / M-Pesa screenshot)' : '(Receipt / Invoice)'}
        </label>
        <label
          onDragOver={e=>{e.preventDefault();setDragOver(true)}}
          onDragLeave={()=>setDragOver(false)}
          onDrop={handleDrop}
          style={{
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8,
            minHeight:110, borderRadius:14, cursor:'pointer', transition:'all 0.18s',
            border:`2px dashed ${proofFile ? accent : dragOver ? accent : 'rgba(255,255,255,0.1)'}`,
            background: proofFile ? accentDim : dragOver ? accentDim : 'rgba(255,255,255,0.02)',
            boxShadow: dragOver ? `0 0 0 4px ${accentBorder}` : 'none',
          }}
        >
          {proofFile ? (
            <>
              <div style={{ fontSize:28 }}>{proofFile.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? '🖼' : '📄'}</div>
              <div style={{ fontSize:13, color:accent, fontWeight:700 }}>✓ {proofFile.name}</div>
              <div style={{ fontSize:11, color:'var(--t3)' }}>{(proofFile.size/1024).toFixed(0)} KB — tap to change</div>
            </>
          ) : (
            <>
              <div style={{ fontSize:28, opacity:0.5 }}>📎</div>
              <div style={{ fontSize:13, color:'var(--t3)', fontWeight:600 }}>Drop file here or click to browse</div>
              <div style={{ fontSize:11, color:'var(--t4)' }}>PNG, JPG, PDF — up to 10 MB</div>
            </>
          )}
          <input type="file" style={{ display:'none' }} accept="image/*,application/pdf"
            onChange={e=>setProofFile(e.target.files?.[0]||null)} />
        </label>
      </div>

      {/* Feedback */}
      {error && (
        <div style={{ background:'rgba(255,107,138,0.08)', border:'1px solid rgba(255,107,138,0.2)', borderRadius:12, padding:'12px 16px', color:'#ff9ab3', fontSize:13, display:'flex', gap:8 }}>
          ⚠ {error}
        </div>
      )}
      {success && (
        <div style={{ background:'rgba(14,207,142,0.08)', border:'1px solid rgba(14,207,142,0.22)', borderRadius:12, padding:'12px 16px', color:'#4dffc0', fontSize:13, display:'flex', gap:8, alignItems:'center' }}>
          <span style={{ fontSize:18 }}>✓</span> Transaction recorded! Redirecting…
        </div>
      )}

      <button type="submit" disabled={loading||success} className={`btn ${isIn?'btn-primary':'btn-danger'}`}
        style={{ width:'100%', padding:'14px', fontSize:15, borderRadius:12, marginTop:4,
          ...(isIn ? {} : { background:'linear-gradient(135deg,#ff6b8a,#e53e6a)', color:'white', border:'none', boxShadow:'0 4px 16px rgba(255,107,138,0.28)' })
        }}>
        {loading ? (
          <span style={{ display:'flex', alignItems:'center', gap:9, justifyContent:'center' }}>
            <span style={{ width:15, height:15, border:`2px solid rgba(${isIn?'0,0,0':'255,255,255'},0.2)`, borderTopColor:isIn?'#021a10':'white', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
            Saving…
          </span>
        ) : `Record ${isIn ? 'Investment' : 'Expense'}`}
      </button>

      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        @media (max-width:500px) { .form-2col { grid-template-columns:1fr !important; } }
      `}</style>
    </form>
  )
}
