'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { TransactionType } from '@/types'

const MONEY_IN_METHODS = ['M-Pesa', 'Bank Transfer', 'Cash', 'Cheque', 'Crypto', 'Other']
const MONEY_OUT_CATEGORIES = [
  'Salaries & Payroll', 'Rent & Office', 'Marketing & Ads',
  'Technology & Software', 'Travel & Transport', 'Legal & Compliance',
  'Equipment & Hardware', 'Utilities', 'Operations', 'Other',
]

const FIXED_USER_ID = '1be5b2ed-fa7f-4d62-98be-5b97500c6e70' // admin@cabanafinance.co

interface Props { type: TransactionType }

const S = {
  label: { fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 6, display: 'block', letterSpacing: '0.2px' } as React.CSSProperties,
  input: {
    width: '100%', background: 'rgba(30,41,59,0.8)', border: '1.5px solid rgba(51,65,85,0.8)',
    borderRadius: 10, padding: '12px 14px', fontSize: 15, color: '#f1f5f9', outline: 'none',
    transition: 'border-color 0.2s', WebkitAppearance: 'none', boxSizing: 'border-box',
  } as React.CSSProperties,
  select: {
    width: '100%', background: 'rgba(30,41,59,0.8)', border: '1.5px solid rgba(51,65,85,0.8)',
    borderRadius: 10, padding: '12px 14px', fontSize: 15, color: '#f1f5f9', outline: 'none',
    cursor: 'pointer', boxSizing: 'border-box',
  } as React.CSSProperties,
  textarea: {
    width: '100%', background: 'rgba(30,41,59,0.8)', border: '1.5px solid rgba(51,65,85,0.8)',
    borderRadius: 10, padding: '12px 14px', fontSize: 15, color: '#f1f5f9', outline: 'none',
    resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  } as React.CSSProperties,
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 } as React.CSSProperties,
  field: { display: 'flex', flexDirection: 'column' as const },
}

export default function TransactionForm({ type }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const isIn = type === 'money_in'

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
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

  const set = (key: string, value: string) => setForm(p => ({ ...p, [key]: value }))

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = isIn ? '#10b981' : '#f87171'
    e.target.style.boxShadow = isIn ? '0 0 0 3px rgba(16,185,129,0.12)' : '0 0 0 3px rgba(248,113,113,0.12)'
  }
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'rgba(51,65,85,0.8)'
    e.target.style.boxShadow = 'none'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let proof_url = null
      let proof_filename = null

      if (proofFile) {
        const ext = proofFile.name.split('.').pop()
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('finance-proofs')
          .upload(filename, proofFile)
        if (uploadError) throw new Error('Failed to upload proof: ' + uploadError.message)
        proof_url = uploadData.path
        proof_filename = proofFile.name
      }

      const payload: Record<string, unknown> = {
        type,
        date: form.date,
        amount: parseFloat(form.amount),
        description: form.description || null,
        notes: form.notes || null,
        proof_url,
        proof_filename,
        created_by: FIXED_USER_ID,
      }

      if (isIn) {
        payload.payment_method = form.payment_method
        payload.reference_number = form.reference_number || null
      } else {
        payload.category = form.category
        payload.project_purpose = form.project_purpose || null
      }

      const { error: insertError } = await supabase.from('finance_transactions').insert([payload])
      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => { router.push('/transactions'); router.refresh() }, 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const accentColor = isIn ? '#10b981' : '#f87171'
  const btnBg = isIn
    ? 'linear-gradient(135deg, #10b981, #059669)'
    : 'linear-gradient(135deg, #ef4444, #dc2626)'

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Date + Amount */}
      <div style={S.row} className="form-row">
        <div style={S.field}>
          <label style={S.label}>Date *</label>
          <input type="date" required value={form.date}
            onChange={e => set('date', e.target.value)}
            onFocus={focusStyle} onBlur={blurStyle}
            style={S.input} />
        </div>
        <div style={S.field}>
          <label style={S.label}>Amount (KES) *</label>
          <input type="number" required min="1" step="0.01" value={form.amount}
            onChange={e => set('amount', e.target.value)}
            placeholder="0.00"
            onFocus={focusStyle} onBlur={blurStyle}
            style={S.input} />
        </div>
      </div>

      {/* Type-specific */}
      {isIn ? (
        <div style={S.row} className="form-row">
          <div style={S.field}>
            <label style={S.label}>Payment Method *</label>
            <select value={form.payment_method} onChange={e => set('payment_method', e.target.value)}
              onFocus={focusStyle} onBlur={blurStyle} style={S.select}>
              {MONEY_IN_METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div style={S.field}>
            <label style={S.label}>Reference Number</label>
            <input type="text" value={form.reference_number}
              onChange={e => set('reference_number', e.target.value)}
              placeholder="e.g. QAB1234XYZ"
              onFocus={focusStyle} onBlur={blurStyle}
              style={S.input} />
          </div>
        </div>
      ) : (
        <div style={S.row} className="form-row">
          <div style={S.field}>
            <label style={S.label}>Category *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}
              onFocus={focusStyle} onBlur={blurStyle} style={S.select}>
              {MONEY_OUT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={S.field}>
            <label style={S.label}>Project / Purpose</label>
            <input type="text" value={form.project_purpose}
              onChange={e => set('project_purpose', e.target.value)}
              placeholder="e.g. Website development"
              onFocus={focusStyle} onBlur={blurStyle}
              style={S.input} />
          </div>
        </div>
      )}

      {/* Description */}
      <div style={S.field}>
        <label style={S.label}>Description</label>
        <input type="text" value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder={isIn ? 'e.g. Seed round tranche 1' : 'e.g. Monthly office rent - July 2026'}
          onFocus={focusStyle} onBlur={blurStyle}
          style={S.input} />
      </div>

      {/* Notes */}
      <div style={S.field}>
        <label style={S.label}>Notes</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
          rows={3} placeholder="Any additional context..."
          onFocus={focusStyle} onBlur={blurStyle}
          style={S.textarea} />
      </div>

      {/* Proof Upload */}
      <div style={S.field}>
        <label style={S.label}>
          Upload Proof {isIn ? '(Receipt, Bank slip, M-Pesa screenshot)' : '(Receipt or Invoice)'}
        </label>
        <label style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: 96, border: `2px dashed ${proofFile ? accentColor : 'rgba(51,65,85,0.6)'}`,
          borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
          background: proofFile ? `rgba(${isIn ? '16,185,129' : '239,68,68'},0.06)` : 'rgba(30,41,59,0.4)',
        }}>
          {proofFile ? (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: accentColor }}>✓ {proofFile.name}</div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{(proofFile.size / 1024).toFixed(0)} KB · tap to change</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 22, marginBottom: 6 }}>📎</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Tap to upload file</div>
              <div style={{ fontSize: 11, color: '#334155', marginTop: 3 }}>PNG, JPG, PDF up to 10MB</div>
            </>
          )}
          <input type="file" style={{ display: 'none' }} accept="image/*,application/pdf"
            onChange={e => setProofFile(e.target.files?.[0] || null)} />
        </label>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#fca5a5' }}>
          ⚠ {error}
        </div>
      )}

      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#6ee7b7' }}>
          ✓ Recorded successfully! Redirecting to transactions...
        </div>
      )}

      <button type="submit" disabled={loading || success} style={{
        width: '100%', background: btnBg, color: 'white', border: 'none',
        borderRadius: 12, padding: '15px', fontSize: 15, fontWeight: 700,
        cursor: loading || success ? 'not-allowed' : 'pointer',
        opacity: loading || success ? 0.7 : 1,
        boxShadow: isIn ? '0 8px 24px rgba(16,185,129,0.25)' : '0 8px 24px rgba(239,68,68,0.2)',
        transition: 'all 0.2s',
      }}>
        {loading ? 'Saving…' : `Record ${isIn ? 'Investment' : 'Expense'}`}
      </button>

      <style>{`
        @media (max-width: 600px) {
          .form-row { grid-template-columns: 1fr !important; }
        }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6); }
        option { background: #1e293b; color: #f1f5f9; }
      `}</style>
    </form>
  )
}
