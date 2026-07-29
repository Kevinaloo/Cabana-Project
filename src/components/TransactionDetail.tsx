'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction } from '@/types'

const MONEY_IN_METHODS = ['M-Pesa', 'Bank Transfer', 'Cash', 'Cheque', 'Crypto', 'Other']
const MONEY_OUT_CATEGORIES = [
  'Salaries & Payroll','Rent & Office','Marketing & Ads',
  'Technology & Software','Travel & Transport','Legal & Compliance',
  'Equipment & Hardware','Utilities','Operations','Other',
]

interface Props {
  transaction: Transaction
  balanceBefore: number
  balanceAfter: number
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
  const [downloadingProof, setDownloadingProof] = useState(false)
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
  const accentGlow = isIn ? 'rgba(16,185,129,0.15)' : 'rgba(248,113,113,0.12)'
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(15,23,42,0.9)',
    border: '1.5px solid rgba(51,65,85,0.7)',
    borderRadius: 10, padding: '11px 14px', fontSize: 14,
    color: '#f8fafc', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Inter,sans-serif', transition: 'border-color 0.18s, box-shadow 0.18s',
  }

  async function getOrLoadProof(): Promise<string | null> {
    if (proofUrl) return proofUrl
    if (!txn.proof_url) return null
    setLoadingProof(true)
    const { data } = await supabase.storage.from('transaction-proofs').createSignedUrl(txn.proof_url, 600)
    setLoadingProof(false)
    if (data?.signedUrl) { setProofUrl(data.signedUrl); return data.signedUrl }
    return null
  }

  async function handlePreview() {
    const url = await getOrLoadProof()
    if (!url) return
  }

  async function handleDownload() {
    setDownloadingProof(true)
    const url = await getOrLoadProof()
    if (!url) { setDownloadingProof(false); return }
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = txn.proof_filename || `proof-${txn.id.slice(0,8)}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch { window.open(url, '_blank') }
    setDownloadingProof(false)
  }

  async function handleSave() {
    setSaving(true); setError('')
    try {
      let proof_url = txn.proof_url, proof_filename = txn.proof_filename
      if (newProofFile) {
        const ext = newProofFile.name.split('.').pop()
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { data: up, error: ue } = await supabase.storage.from('transaction-proofs').upload(filename, newProofFile)
        if (ue) throw new Error('Upload failed: ' + ue.message)
        proof_url = up.path; proof_filename = newProofFile.name; setProofUrl(null)
      }
      const payload: Record<string, unknown> = {
        id: txn.id, date: form.date, amount: parseFloat(form.amount),
        description: form.description || null, notes: form.notes || null,
        proof_url, proof_filename,
      }
      if (isIn) { payload.payment_method = form.payment_method; payload.reference_number = form.reference_number || null }
      else { payload.category = form.category; payload.project_purpose = form.project_purpose || null }

      const res = await fetch('/api/transactions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Save failed')
      setTxn(body); setEditing(false); setNewProofFile(null); router.refresh()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Save failed') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch('/api/transactions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: txn.id }) })
      if (!res.ok) throw new Error('Delete failed')
      router.push('/transactions'); router.refresh()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Delete failed'); setDeleting(false) }
  }

  const isImage = (txn.proof_filename || '').match(/\.(jpg|jpeg|png|gif|webp)$/i)

  return (
    <div className="page-enter" style={{ paddingBottom: 48 }}>

      {/* Back */}
      <button onClick={() => router.back()} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-3)', fontSize: 13, display: 'flex', alignItems: 'center',
        gap: 6, marginBottom: 20, padding: 0, fontFamily: 'Inter,sans-serif',
        transition: 'color 0.15s',
      }} className="back-btn">
        ← Back to Transactions
      </button>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span className={`badge ${isIn ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 12 }}>
              {isIn ? '↑ Money In' : '↓ Money Out'}
            </span>
            {txn.proof_url && <span className="badge badge-blue" style={{ fontSize: 11 }}>📎 Has Proof</span>}
          </div>
          <h1 style={{
            fontFamily: 'Manrope,sans-serif', fontSize: 32, fontWeight: 800,
            color: accent, letterSpacing: '-1px', lineHeight: 1, marginBottom: 6,
          }}>
            {isIn ? '+' : '-'}{formatCurrency(txn.amount)}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)' }}>
            {formatDate(txn.date)}
            {(txn.description || txn.category || txn.payment_method) && (
              <> · <span style={{ color: 'var(--text-2)' }}>{txn.description || txn.category || txn.payment_method}</span></>
            )}
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          {!editing ? (
            <>
              <button onClick={() => setEditing(true)} className="btn btn-ghost">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit
              </button>
              <button onClick={() => setConfirmDelete(true)} className="btn btn-danger" style={{ padding: '10px 16px' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setEditing(false); setError('') }} className="btn btn-ghost">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-blue">
                {saving ? 'Saving…' : '✓ Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12, padding: '12px 16px', color: '#fca5a5', fontSize: 14, marginBottom: 20 }}>
          ⚠ {error}
        </div>
      )}

      {/* ── Balance flow ── */}
      <div className="card" style={{ display: 'flex', overflow: 'hidden', padding: 0, marginBottom: 16 }}>
        {[
          { label: 'Balance Before', value: balanceBefore, color: balanceBefore >= 0 ? '#93c5fd' : '#fcd34d', sub: 'Prior running total' },
          { label: 'This Transaction', value: txn.amount * (isIn ? 1 : -1), color: accent, sub: isIn ? 'Investment received' : 'Expense paid', highlight: true },
          { label: 'Balance After', value: balanceAfter, color: balanceAfter >= 0 ? '#93c5fd' : '#fcd34d', sub: 'Updated running total' },
        ].map((item, i) => (
          <div key={item.label} style={{
            flex: 1, padding: '18px 16px',
            borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            background: item.highlight ? accentGlow : 'transparent',
            textAlign: 'center',
          }}>
            <div className="section-label" style={{ marginBottom: 8 }}>{item.label}</div>
            <div className="num" style={{ fontSize: 20, fontWeight: 800, color: item.color, letterSpacing: '-0.5px' }}>
              {item.value >= 0 ? '' : ''}{formatCurrency(Math.abs(item.value))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4 }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }} id="detail-grid">

        {/* Left: all fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Transaction fields */}
          <div className="card" style={{ padding: '22px 22px' }}>
            <p className="section-label" style={{ marginBottom: 18 }}>Transaction Details</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} id="fields-grid">
              <div>
                <label className="section-label" style={{ marginBottom: 6, display: 'block' }}>Date</label>
                {editing
                  ? <input type="date" value={form.date} onChange={e=>set('date',e.target.value)} style={inputStyle} />
                  : <p style={{ fontSize: 15, color: 'var(--text-1)', fontWeight: 500 }}>{formatDate(txn.date)}</p>}
              </div>
              <div>
                <label className="section-label" style={{ marginBottom: 6, display: 'block' }}>Amount (KES)</label>
                {editing
                  ? <input type="number" min="1" step="0.01" value={form.amount} onChange={e=>set('amount',e.target.value)} style={inputStyle} />
                  : <p className="num" style={{ fontSize: 20, fontWeight: 800, color: accent, letterSpacing: '-0.5px' }}>{formatCurrency(txn.amount)}</p>}
              </div>

              {isIn ? (
                <>
                  <div>
                    <label className="section-label" style={{ marginBottom: 6, display: 'block' }}>Payment Method</label>
                    {editing
                      ? <select value={form.payment_method} onChange={e=>set('payment_method',e.target.value)} style={inputStyle}>{MONEY_IN_METHODS.map(m=><option key={m}>{m}</option>)}</select>
                      : <p style={{ fontSize: 14, color: 'var(--text-1)' }}>{txn.payment_method || '—'}</p>}
                  </div>
                  <div>
                    <label className="section-label" style={{ marginBottom: 6, display: 'block' }}>Reference Number</label>
                    {editing
                      ? <input type="text" value={form.reference_number} onChange={e=>set('reference_number',e.target.value)} placeholder="e.g. QAB1234XYZ" style={inputStyle} />
                      : <p style={{ fontSize: 14, color: '#a3e635', fontFamily: 'monospace', fontWeight: 600 }}>{txn.reference_number || '—'}</p>}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="section-label" style={{ marginBottom: 6, display: 'block' }}>Category</label>
                    {editing
                      ? <select value={form.category} onChange={e=>set('category',e.target.value)} style={inputStyle}>{MONEY_OUT_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
                      : <span className="badge badge-red" style={{ fontSize: 12 }}>{txn.category || '—'}</span>}
                  </div>
                  <div>
                    <label className="section-label" style={{ marginBottom: 6, display: 'block' }}>Project / Purpose</label>
                    {editing
                      ? <input type="text" value={form.project_purpose} onChange={e=>set('project_purpose',e.target.value)} placeholder="e.g. Website development" style={inputStyle} />
                      : <p style={{ fontSize: 14, color: 'var(--text-1)' }}>{txn.project_purpose || '—'}</p>}
                  </div>
                </>
              )}
            </div>

            {/* Description */}
            <div style={{ marginTop: 18 }}>
              <label className="section-label" style={{ marginBottom: 6, display: 'block' }}>Description</label>
              {editing
                ? <input type="text" value={form.description} onChange={e=>set('description',e.target.value)} placeholder="What is this for?" style={inputStyle} />
                : <p style={{ fontSize: 14, color: txn.description ? 'var(--text-1)' : 'var(--text-4)' }}>{txn.description || 'No description added'}</p>}
            </div>

            {/* Notes */}
            <div style={{ marginTop: 16 }}>
              <label className="section-label" style={{ marginBottom: 6, display: 'block' }}>Notes</label>
              {editing
                ? <textarea value={form.notes} onChange={e=>set('notes',e.target.value)} rows={3} placeholder="Additional context…" style={{ ...inputStyle, resize: 'none', fontFamily: 'Inter,sans-serif' } as React.CSSProperties} />
                : <p style={{ fontSize: 14, color: txn.notes ? 'var(--text-2)' : 'var(--text-4)', lineHeight: 1.65 }}>{txn.notes || 'No notes'}</p>}
            </div>
          </div>

          {/* Record metadata */}
          <div className="card" style={{ padding: '18px 22px' }}>
            <p className="section-label" style={{ marginBottom: 14 }}>Record Metadata</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Transaction ID', value: txn.id, mono: true },
                { label: 'Created', value: new Date(txn.created_at).toLocaleString('en-KE', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) },
                { label: 'Last Updated', value: new Date(txn.updated_at).toLocaleString('en-KE', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) },
                { label: 'Type', value: isIn ? 'Investment (Money In)' : 'Expense (Money Out)' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, flexShrink: 0 }}>{row.label}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-2)', textAlign: 'right', fontFamily: row.mono ? 'monospace' : undefined, wordBreak: 'break-all' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: proof */}
        <div>
          <div className="card" style={{ padding: '22px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <p className="section-label">Proof / Evidence</p>
              {txn.proof_url && !editing && (
                <button
                  onClick={handleDownload}
                  disabled={downloadingProof}
                  className="btn btn-blue"
                  style={{ padding: '7px 14px', fontSize: 12 }}
                >
                  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {downloadingProof ? 'Downloading…' : 'Download'}
                </button>
              )}
            </div>

            {txn.proof_url ? (
              <div>
                {/* File info pill */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 14px', marginBottom: 14,
                  background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.18)',
                  borderRadius: 10,
                }}>
                  <span style={{ fontSize: 22 }}>{isImage ? '🖼' : '📄'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: '#93c5fd', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {txn.proof_filename || 'Proof file'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{isImage ? 'Image' : 'Document'} · Click below to preview</div>
                  </div>
                </div>

                {/* Preview */}
                {!proofUrl ? (
                  <button
                    onClick={handlePreview}
                    disabled={loadingProof}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.02)',
                      border: '2px dashed rgba(255,255,255,0.08)',
                      borderRadius: 12, padding: '36px 20px',
                      cursor: loadingProof ? 'wait' : 'pointer',
                      color: 'var(--text-3)', fontSize: 14,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      transition: 'all 0.15s',
                    }}
                    className="preview-btn"
                  >
                    <span style={{ fontSize: 30 }}>{loadingProof ? '⏳' : '🔍'}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>
                      {loadingProof ? 'Loading…' : 'Click to Preview'}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-4)' }}>Opens inline without leaving the page</span>
                  </button>
                ) : isImage ? (
                  <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 10, background: '#080d1a' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={proofUrl} alt="Transaction proof" style={{ width: '100%', display: 'block', maxHeight: 440, objectFit: 'contain' }} />
                  </div>
                ) : (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '24px', textAlign: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
                    <p style={{ fontSize: 14, color: 'var(--text-2)' }}>PDF Document</p>
                  </div>
                )}

                {/* Action row */}
                {proofUrl && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <a
                      href={proofUrl} target="_blank" rel="noopener noreferrer"
                      className="btn btn-ghost"
                      style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '9px 12px', textDecoration: 'none' }}
                    >
                      ↗ Open in New Tab
                    </a>
                    <button
                      onClick={handleDownload}
                      disabled={downloadingProof}
                      className="btn btn-blue"
                      style={{ flex: 1, fontSize: 12, padding: '9px 12px' }}
                    >
                      <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {downloadingProof ? 'Saving…' : 'Download File'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-4)' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 4 }}>No proof uploaded</p>
                <p style={{ fontSize: 12, color: 'var(--text-4)' }}>Edit this transaction to attach a receipt or screenshot</p>
              </div>
            )}

            {/* Replace proof in edit mode */}
            {editing && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <label className="section-label" style={{ marginBottom: 8, display: 'block' }}>{txn.proof_url ? 'Replace Proof' : 'Upload Proof'}</label>
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  height: 76, border: `2px dashed ${newProofFile ? accent : 'rgba(51,65,85,0.6)'}`,
                  borderRadius: 10, cursor: 'pointer',
                  background: newProofFile ? `rgba(${isIn ? '16,185,129' : '248,113,113'},0.05)` : 'rgba(15,23,42,0.4)',
                  transition: 'all 0.15s',
                }}>
                  {newProofFile
                    ? <div style={{ fontSize: 13, color: accent, fontWeight: 600 }}>✓ {newProofFile.name}</div>
                    : <div style={{ fontSize: 13, color: 'var(--text-3)' }}>📎 Tap to select file</div>}
                  <input type="file" style={{ display: 'none' }} accept="image/*,application/pdf" onChange={e=>setNewProofFile(e.target.files?.[0]||null)} />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete modal */}
      {confirmDelete && (
        <div className="fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}>
          <div className="card card-enter" style={{ maxWidth: 380, width: '100%', padding: '28px 26px' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
              <h3 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 18, fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>Delete Transaction?</h3>
              <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.6 }}>
                This will permanently remove the{' '}
                <strong style={{ color: accent }}>{isIn ? '+' : '-'}{formatCurrency(txn.amount)}</strong>{' '}
                transaction from {formatDate(txn.date)}. This cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="btn btn-danger" style={{ flex: 1 }}>
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        #detail-grid { grid-template-columns: 1fr; }
        @media (min-width: 900px) { #detail-grid { grid-template-columns: 1fr 360px; } }
        #fields-grid { grid-template-columns: 1fr 1fr; }
        @media (max-width: 500px) { #fields-grid { grid-template-columns: 1fr; } }
        .back-btn:hover { color: var(--text-2) !important; }
        .preview-btn:hover { border-color: rgba(255,255,255,0.15) !important; background: rgba(255,255,255,0.03) !important; }
        option { background: #111827; color: #f8fafc; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
      `}</style>
    </div>
  )
}
