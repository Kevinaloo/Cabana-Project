'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction } from '@/types'

const MONEY_IN_METHODS = ['M-Pesa', 'Bank Transfer', 'Cash', 'Cheque', 'Crypto', 'Other']
const MONEY_OUT_CATEGORIES = [
  'Salaries & Payroll', 'Rent & Office', 'Marketing & Ads',
  'Technology & Software', 'Travel & Transport', 'Legal & Compliance',
  'Equipment & Hardware', 'Utilities', 'Operations', 'Other',
]

interface Props {
  transaction: Transaction
  balanceBefore: number
  balanceAfter: number
}

const S = {
  label: { fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block', textTransform: 'uppercase' as const, letterSpacing: '0.5px' },
  value: { fontSize: 15, color: '#e2e8f0', fontWeight: 500 },
  input: {
    width: '100%', background: 'rgba(30,41,59,0.9)', border: '1.5px solid rgba(51,65,85,0.8)',
    borderRadius: 10, padding: '11px 14px', fontSize: 15, color: '#f1f5f9', outline: 'none',
    boxSizing: 'border-box' as const,
  },
  select: {
    width: '100%', background: 'rgba(30,41,59,0.9)', border: '1.5px solid rgba(51,65,85,0.8)',
    borderRadius: 10, padding: '11px 14px', fontSize: 15, color: '#f1f5f9', outline: 'none',
    cursor: 'pointer', boxSizing: 'border-box' as const,
  },
  textarea: {
    width: '100%', background: 'rgba(30,41,59,0.9)', border: '1.5px solid rgba(51,65,85,0.8)',
    borderRadius: 10, padding: '11px 14px', fontSize: 15, color: '#f1f5f9', outline: 'none',
    resize: 'none' as const, fontFamily: 'inherit', boxSizing: 'border-box' as const,
  },
  field: { display: 'flex', flexDirection: 'column' as const },
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 14, padding: '20px',
  },
}

export default function TransactionDetail({ transaction: initial, balanceBefore, balanceAfter }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [txn, setTxn] = useState<Transaction>(initial)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')
  const [proofUrl, setProofUrl] = useState<string | null>(null)
  const [loadingProof, setLoadingProof] = useState(false)
  const [newProofFile, setNewProofFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    date: txn.date,
    amount: String(txn.amount),
    description: txn.description || '',
    notes: txn.notes || '',
    payment_method: txn.payment_method || 'M-Pesa',
    reference_number: txn.reference_number || '',
    category: txn.category || 'Operations',
    project_purpose: txn.project_purpose || '',
  })

  const isIn = txn.type === 'money_in'
  const accent = isIn ? '#10b981' : '#f87171'

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  async function loadProof() {
    if (!txn.proof_url || proofUrl) return
    setLoadingProof(true)
    const { data } = await supabase.storage
      .from('transaction-proofs')
      .createSignedUrl(txn.proof_url, 300)
    if (data?.signedUrl) setProofUrl(data.signedUrl)
    setLoadingProof(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      let proof_url = txn.proof_url
      let proof_filename = txn.proof_filename

      // Upload new proof if changed
      if (newProofFile) {
        const ext = newProofFile.name.split('.').pop()
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('transaction-proofs').upload(filename, newProofFile)
        if (uploadError) throw new Error('Proof upload failed: ' + uploadError.message)
        proof_url = uploadData.path
        proof_filename = newProofFile.name
        setProofUrl(null) // reset so it reloads
      }

      const payload: Record<string, unknown> = {
        id: txn.id,
        date: form.date,
        amount: parseFloat(form.amount),
        description: form.description || null,
        notes: form.notes || null,
        proof_url,
        proof_filename,
      }
      if (isIn) {
        payload.payment_method = form.payment_method
        payload.reference_number = form.reference_number || null
      } else {
        payload.category = form.category
        payload.project_purpose = form.project_purpose || null
      }

      const res = await fetch('/api/transactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Save failed')

      setTxn(body)
      setEditing(false)
      setNewProofFile(null)
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch('/api/transactions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: txn.id }),
      })
      if (!res.ok) throw new Error('Delete failed')
      router.push('/transactions')
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed')
      setDeleting(false)
    }
  }

  return (
    <div className="txn-detail-root">
      {/* Back + header */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: 0 }}
        >
          ← Back to Transactions
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 999, fontSize: 13, fontWeight: 700,
                background: isIn ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)',
                color: accent,
              }}>
                {isIn ? '↑ Money In' : '↓ Money Out'}
              </span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', margin: 0, letterSpacing: '-0.5px' }}>
              {txn.type === 'money_in' ? '+' : '-'}{formatCurrency(txn.amount)}
            </h1>
            <p style={{ fontSize: 14, color: '#475569', marginTop: 4 }}>
              {formatDate(txn.date)} · {txn.description || txn.category || txn.payment_method || 'No description'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!editing ? (
              <>
                <button onClick={() => setEditing(true)} style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '9px 18px', color: '#e2e8f0', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>
                  ✏️ Edit
                </button>
                <button onClick={() => setConfirmDelete(true)} style={{
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 10, padding: '9px 18px', color: '#f87171', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>
                  🗑 Delete
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { setEditing(false); setError('') }} style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, padding: '9px 18px', color: '#94a3b8', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} style={{
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none',
                  borderRadius: 10, padding: '9px 20px', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  opacity: saving ? 0.7 : 1,
                }}>
                  {saving ? 'Saving…' : '✓ Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '12px 16px', color: '#fca5a5', fontSize: 14, marginBottom: 20 }}>
          ⚠ {error}
        </div>
      )}

      {/* Balance flow */}
      <div style={{ ...S.card, marginBottom: 16, display: 'flex', gap: 0, overflow: 'hidden', padding: 0 }}>
        <div style={{ flex: 1, padding: '16px 20px', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Balance Before</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: balanceBefore >= 0 ? '#60a5fa' : '#fbbf24' }}>{formatCurrency(balanceBefore)}</div>
        </div>
        <div style={{ flex: 1, padding: '16px 20px', borderRight: '1px solid rgba(255,255,255,0.06)', background: isIn ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)' }}>
          <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>This Transaction</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: accent }}>
            {isIn ? '+' : '-'}{formatCurrency(txn.amount)}
          </div>
        </div>
        <div style={{ flex: 1, padding: '16px 20px' }}>
          <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Balance After</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: balanceAfter >= 0 ? '#60a5fa' : '#fbbf24' }}>{formatCurrency(balanceAfter)}</div>
        </div>
      </div>

      <div className="detail-grid">
        {/* Left column - transaction fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Core fields */}
          <div style={S.card}>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 16px' }}>Transaction Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="fields-grid">
              {/* Date */}
              <div style={S.field}>
                <label style={S.label}>Date</label>
                {editing
                  ? <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={S.input} />
                  : <div style={S.value}>{formatDate(txn.date)}</div>
                }
              </div>
              {/* Amount */}
              <div style={S.field}>
                <label style={S.label}>Amount (KES)</label>
                {editing
                  ? <input type="number" min="1" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} style={S.input} />
                  : <div style={{ ...S.value, color: accent, fontWeight: 700, fontSize: 18 }}>{formatCurrency(txn.amount)}</div>
                }
              </div>

              {/* Money In specific */}
              {isIn && (
                <>
                  <div style={S.field}>
                    <label style={S.label}>Payment Method</label>
                    {editing
                      ? <select value={form.payment_method} onChange={e => set('payment_method', e.target.value)} style={S.select}>
                          {MONEY_IN_METHODS.map(m => <option key={m}>{m}</option>)}
                        </select>
                      : <div style={S.value}>{txn.payment_method || '—'}</div>
                    }
                  </div>
                  <div style={S.field}>
                    <label style={S.label}>Reference Number</label>
                    {editing
                      ? <input type="text" value={form.reference_number} onChange={e => set('reference_number', e.target.value)} placeholder="e.g. QAB1234XYZ" style={S.input} />
                      : <div style={{ ...S.value, fontFamily: 'monospace', fontSize: 14, color: '#a3e635' }}>{txn.reference_number || '—'}</div>
                    }
                  </div>
                </>
              )}

              {/* Money Out specific */}
              {!isIn && (
                <>
                  <div style={S.field}>
                    <label style={S.label}>Category</label>
                    {editing
                      ? <select value={form.category} onChange={e => set('category', e.target.value)} style={S.select}>
                          {MONEY_OUT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      : <div style={S.value}>
                          <span style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '3px 10px', borderRadius: 6, fontSize: 13 }}>
                            {txn.category || '—'}
                          </span>
                        </div>
                    }
                  </div>
                  <div style={S.field}>
                    <label style={S.label}>Project / Purpose</label>
                    {editing
                      ? <input type="text" value={form.project_purpose} onChange={e => set('project_purpose', e.target.value)} placeholder="e.g. Website development" style={S.input} />
                      : <div style={S.value}>{txn.project_purpose || '—'}</div>
                    }
                  </div>
                </>
              )}
            </div>

            {/* Description - full width */}
            <div style={{ ...S.field, marginTop: 16 }}>
              <label style={S.label}>Description</label>
              {editing
                ? <input type="text" value={form.description} onChange={e => set('description', e.target.value)} placeholder="What is this transaction for?" style={S.input} />
                : <div style={{ ...S.value, fontSize: 15 }}>{txn.description || <span style={{ color: '#334155' }}>No description</span>}</div>
              }
            </div>

            {/* Notes - full width */}
            <div style={{ ...S.field, marginTop: 16 }}>
              <label style={S.label}>Notes</label>
              {editing
                ? <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Any additional context..." style={S.textarea} />
                : <div style={{ ...S.value, fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>{txn.notes || <span style={{ color: '#334155' }}>No notes</span>}</div>
              }
            </div>
          </div>

          {/* Metadata */}
          <div style={S.card}>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 14px' }}>Record Info</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#475569' }}>Transaction ID</span>
                <span style={{ fontSize: 12, color: '#334155', fontFamily: 'monospace' }}>{txn.id.slice(0, 8)}…</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#475569' }}>Created</span>
                <span style={{ fontSize: 13, color: '#64748b' }}>
                  {new Date(txn.created_at).toLocaleString('en-KE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#475569' }}>Last Updated</span>
                <span style={{ fontSize: 13, color: '#64748b' }}>
                  {new Date(txn.updated_at).toLocaleString('en-KE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - proof */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={S.card}>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 16px' }}>
              Proof / Evidence
            </h2>

            {txn.proof_url ? (
              <div>
                {/* Proof file name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>📎</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {txn.proof_filename || 'proof'}
                    </div>
                    <div style={{ fontSize: 11, color: '#475569' }}>Uploaded proof</div>
                  </div>
                </div>

                {/* Preview / open button */}
                {!proofUrl ? (
                  <button
                    onClick={loadProof}
                    disabled={loadingProof}
                    style={{
                      width: '100%', background: 'rgba(37,99,235,0.12)', border: '1.5px dashed rgba(37,99,235,0.3)',
                      borderRadius: 10, padding: '32px 20px', cursor: 'pointer', color: '#60a5fa', fontSize: 14, fontWeight: 600,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 28 }}>🔍</span>
                    {loadingProof ? 'Loading proof…' : 'Click to Preview Proof'}
                  </button>
                ) : (
                  <div>
                    {/* If image, show inline preview */}
                    {(txn.proof_filename || '').match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 10 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={proofUrl} alt="Transaction proof" style={{ width: '100%', display: 'block', maxHeight: 400, objectFit: 'contain', background: '#0f172a' }} />
                      </div>
                    ) : (
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '20px', textAlign: 'center', marginBottom: 10, color: '#94a3b8', fontSize: 14 }}>
                        📄 PDF document
                      </div>
                    )}
                    <a
                      href={proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block', textAlign: 'center', background: 'rgba(37,99,235,0.12)',
                        border: '1px solid rgba(37,99,235,0.25)', borderRadius: 10, padding: '10px',
                        color: '#60a5fa', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                      }}
                    >
                      ↗ Open in New Tab
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 20px', color: '#334155' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                <div style={{ fontSize: 14, color: '#475569' }}>No proof uploaded</div>
                {editing && <div style={{ fontSize: 12, color: '#334155', marginTop: 4 }}>Upload one below when editing</div>}
              </div>
            )}

            {/* Replace / add proof in edit mode */}
            {editing && (
              <div style={{ marginTop: 14 }}>
                <label style={{ ...S.label, marginBottom: 8 }}>{txn.proof_url ? 'Replace Proof' : 'Upload Proof'}</label>
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  height: 80, border: `2px dashed ${newProofFile ? accent : 'rgba(51,65,85,0.6)'}`,
                  borderRadius: 10, cursor: 'pointer', background: newProofFile ? `rgba(${isIn ? '16,185,129' : '239,68,68'},0.06)` : 'rgba(30,41,59,0.4)',
                }}>
                  {newProofFile ? (
                    <div style={{ fontSize: 13, color: accent, fontWeight: 600 }}>✓ {newProofFile.name}</div>
                  ) : (
                    <div style={{ fontSize: 13, color: '#475569' }}>📎 Tap to select file</div>
                  )}
                  <input type="file" style={{ display: 'none' }} accept="image/*,application/pdf"
                    onChange={e => setNewProofFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{ background: '#0f1929', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: 28, maxWidth: 380, width: '100%' }}>
            <div style={{ fontSize: 28, textAlign: 'center', marginBottom: 12 }}>🗑</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', textAlign: 'center', margin: '0 0 8px' }}>
              Delete Transaction?
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', margin: '0 0 24px', lineHeight: 1.6 }}>
              This will permanently remove this {isIn ? '+' : '-'}{formatCurrency(txn.amount)} transaction and cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(false)} style={{
                flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, padding: '12px', color: '#94a3b8', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting} style={{
                flex: 1, background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none',
                borderRadius: 10, padding: '12px', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                opacity: deleting ? 0.7 : 1,
              }}>
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .txn-detail-root { padding-top: 56px; }
        @media (min-width: 768px) { .txn-detail-root { padding-top: 0; } }
        .detail-grid { display: grid; grid-template-columns: 1fr; gap: 14; }
        @media (min-width: 900px) { .detail-grid { grid-template-columns: 1fr 380px; } }
        .fields-grid { grid-template-columns: 1fr 1fr !important; }
        @media (max-width: 480px) { .fields-grid { grid-template-columns: 1fr !important; } }
        option { background: #1e293b; color: #f1f5f9; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6); }
      `}</style>
    </div>
  )
}
