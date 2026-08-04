'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction } from '@/types'

const MONEY_IN_METHODS = ['M-Pesa','Bank Transfer','Cash','Cheque','Crypto','Other']
const MONEY_OUT_CATS   = ['Salaries & Payroll','Rent & Office','Marketing & Ads','Technology & Software','Travel & Transport','Legal & Compliance','Equipment & Hardware','Utilities','Operations','Other']

interface Props { transaction:Transaction; balanceBefore:number; balanceAfter:number }

const inp: React.CSSProperties = {
  width:'100%', background:'rgba(10,16,32,0.85)', backdropFilter:'blur(8px)',
  border:'1.5px solid rgba(255,255,255,0.08)', borderRadius:12,
  padding:'11px 14px', fontSize:14, color:'#f0f6ff', outline:'none',
  fontFamily:'Inter,sans-serif', transition:'border-color 0.18s, box-shadow 0.18s',
  boxSizing:'border-box',
}

export default function TransactionDetail({ transaction:initial, balanceBefore, balanceAfter }:Props) {
  const router  = useRouter()
  const supabase = createClient()
  const [txn, setTxn]                   = useState<Transaction>(initial)
  const [editing, setEditing]           = useState(false)
  const [saving, setSaving]             = useState(false)
  const [deleting, setDeleting]         = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError]               = useState('')
  const [proofUrl, setProofUrl]         = useState<string|null>(null)
  const [loadingProof, setLoadingProof] = useState(false)
  const [downloading, setDownloading]   = useState(false)
  const [newProofFile, setNewProofFile] = useState<File|null>(null)
  const [form, setForm] = useState({
    date: txn.date, amount: String(txn.amount),
    description: txn.description||'', notes: txn.notes||'',
    payment_method: txn.payment_method||'M-Pesa',
    reference_number: txn.reference_number||'',
    category: txn.category||'Operations',
    project_purpose: txn.project_purpose||'',
  })
  const set = (k:string,v:string) => setForm(p=>({...p,[k]:v}))
  const isIn  = txn.type === 'money_in'
  const accent = isIn ? 'var(--green)' : 'var(--red)'
  const isImage = (txn.proof_filename||'').match(/\.(jpg|jpeg|png|gif|webp)$/i)

  function focus(e:React.FocusEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) {
    e.target.style.borderColor = isIn ? 'var(--green)' : 'var(--red)'
    e.target.style.boxShadow   = isIn ? '0 0 0 3px rgba(14,207,142,0.14)' : '0 0 0 3px rgba(255,107,138,0.14)'
  }
  function blur(e:React.FocusEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) {
    e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow='none'
  }

  async function loadProof():Promise<string|null> {
    if (proofUrl) return proofUrl
    if (!txn.proof_url) return null
    setLoadingProof(true)
    const { data } = await supabase.storage.from('transaction-proofs').createSignedUrl(txn.proof_url, 600)
    setLoadingProof(false)
    if (data?.signedUrl) { setProofUrl(data.signedUrl); return data.signedUrl }
    return null
  }

  async function handleDownload() {
    setDownloading(true)
    const url = await loadProof()
    if (!url) { setDownloading(false); return }
    try {
      const blob = await (await fetch(url)).blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = txn.proof_filename||`proof-${txn.id.slice(0,8)}`
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
    } catch { window.open(url,'_blank') }
    setDownloading(false)
  }

  async function handleSave() {
    setSaving(true); setError('')
    try {
      let proof_url=txn.proof_url, proof_filename=txn.proof_filename
      if (newProofFile) {
        const ext=newProofFile.name.split('.').pop()
        const fn=`${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { data:up, error:ue } = await supabase.storage.from('transaction-proofs').upload(fn,newProofFile)
        if (ue) throw new Error('Upload failed: '+ue.message)
        proof_url=up.path; proof_filename=newProofFile.name; setProofUrl(null)
      }
      const payload:Record<string,unknown> = {
        id:txn.id, date:form.date, amount:parseFloat(form.amount),
        description:form.description||null, notes:form.notes||null, proof_url, proof_filename,
      }
      if (isIn) { payload.payment_method=form.payment_method; payload.reference_number=form.reference_number||null }
      else       { payload.category=form.category; payload.project_purpose=form.project_purpose||null }
      const res  = await fetch('/api/transactions',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
      const body = await res.json()
      if (!res.ok) throw new Error(body.error||'Save failed')
      setTxn(body); setEditing(false); setNewProofFile(null); router.refresh()
    } catch(e:unknown) { setError(e instanceof Error ? e.message : 'Save failed') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch('/api/transactions',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:txn.id})})
      if (!res.ok) throw new Error('Delete failed')
      router.push('/transactions'); router.refresh()
    } catch(e:unknown) { setError(e instanceof Error?e.message:'Delete failed'); setDeleting(false) }
  }

  return (
    <div className="page-in" style={{ paddingBottom:48 }}>

      {/* Back */}
      <button onClick={()=>router.back()} style={{
        background:'none', border:'none', cursor:'pointer', color:'var(--t3)',
        fontSize:13, display:'flex', alignItems:'center', gap:6, marginBottom:22,
        padding:0, fontFamily:'Inter,sans-serif', transition:'color 0.15s',
      }} className="back-btn">
        ← Back to Transactions
      </button>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap', marginBottom:24 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:10 }}>
            <span className={`badge ${isIn?'badge-green':'badge-red'}`} style={{ fontSize:12 }}>
              {isIn?'↑ Money In':'↓ Money Out'}
            </span>
            {txn.proof_url && <span className="badge badge-blue" style={{ fontSize:10 }}>📎 Evidence Attached</span>}
          </div>
          <h1 style={{ fontFamily:'Manrope,sans-serif', fontSize:34, fontWeight:900, color:accent, letterSpacing:'-1.2px', lineHeight:1, marginBottom:8 }}>
            {isIn?'+':'-'}{formatCurrency(txn.amount)}
          </h1>
          <p style={{ fontSize:14, color:'var(--t3)' }}>
            {formatDate(txn.date)}
            {(txn.description||txn.category||txn.payment_method) &&
              <> · <span style={{color:'var(--t2)'}}>{txn.description||txn.category||txn.payment_method}</span></>}
          </p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', flexShrink:0 }}>
          {!editing ? (
            <>
              <button onClick={()=>setEditing(true)} className="btn btn-glass">
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Edit
              </button>
              <button onClick={()=>setConfirmDelete(true)} className="btn btn-danger">
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                Delete
              </button>
            </>
          ) : (
            <>
              <button onClick={()=>{setEditing(false);setError('')}} className="btn btn-glass">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-blue">
                {saving?'Saving…':'✓ Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background:'rgba(255,107,138,0.08)', border:'1px solid rgba(255,107,138,0.2)', borderRadius:12, padding:'12px 16px', color:'#ff9ab3', fontSize:13, marginBottom:20 }}>
          ⚠ {error}
        </div>
      )}

      {/* Balance flow triptych */}
      <div className="glass" style={{ display:'flex', overflow:'hidden', padding:0, marginBottom:16 }}>
        {[
          { label:'Balance Before', value:balanceBefore, color:balanceBefore>=0?'var(--blue)':'var(--gold)', sub:'Prior total', hl:false },
          { label:'This Transaction', value:txn.amount*(isIn?1:-1), color:accent, sub:isIn?'Investment received':'Expense paid', hl:true },
          { label:'Balance After', value:balanceAfter, color:balanceAfter>=0?'var(--blue)':'var(--gold)', sub:'Updated total', hl:false },
        ].map((item,i) => (
          <div key={item.label} style={{
            flex:1, padding:'20px 18px', textAlign:'center',
            borderRight: i<2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            background: item.hl ? (isIn?'rgba(14,207,142,0.06)':'rgba(255,107,138,0.05)') : 'transparent',
          }}>
            <div className="section-label" style={{ marginBottom:10 }}>{item.label}</div>
            <div className="num" style={{ fontSize:22, fontWeight:900, color:item.color, letterSpacing:'-0.5px' }}>
              {formatCurrency(Math.abs(item.value))}
            </div>
            <div style={{ fontSize:11, color:'var(--t4)', marginTop:5 }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:14 }} id="detail-grid">

        {/* Left: fields */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          <div className="glass" style={{ padding:'24px 24px' }}>
            <p className="section-label" style={{ marginBottom:20 }}>Transaction Details</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }} id="fields-grid">
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:8 }}>Date</label>
                {editing ? <input type="date" value={form.date} onChange={e=>set('date',e.target.value)} style={inp} onFocus={focus} onBlur={blur} />
                  : <p style={{ fontSize:15, color:'var(--t1)', fontWeight:500 }}>{formatDate(txn.date)}</p>}
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:8 }}>Amount (KES)</label>
                {editing ? <input type="number" min="1" step="0.01" value={form.amount} onChange={e=>set('amount',e.target.value)} style={inp} onFocus={focus} onBlur={blur} />
                  : <p className="num" style={{ fontSize:22, fontWeight:900, color:accent, letterSpacing:'-0.5px' }}>{formatCurrency(txn.amount)}</p>}
              </div>
              {isIn ? (
                <>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:8 }}>Payment Method</label>
                    {editing ? <select value={form.payment_method} onChange={e=>set('payment_method',e.target.value)} style={inp} onFocus={focus} onBlur={blur}>{MONEY_IN_METHODS.map(m=><option key={m}>{m}</option>)}</select>
                      : <p style={{ fontSize:14, color:'var(--t1)' }}>{txn.payment_method||'—'}</p>}
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:8 }}>Reference Number</label>
                    {editing ? <input type="text" value={form.reference_number} onChange={e=>set('reference_number',e.target.value)} placeholder="e.g. QAB1234XYZ" style={inp} onFocus={focus} onBlur={blur} />
                      : <p style={{ fontSize:14, color:'#a3e635', fontFamily:'monospace', fontWeight:700, letterSpacing:'0.5px' }}>{txn.reference_number||'—'}</p>}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:8 }}>Category</label>
                    {editing ? <select value={form.category} onChange={e=>set('category',e.target.value)} style={inp} onFocus={focus} onBlur={blur}>{MONEY_OUT_CATS.map(c=><option key={c}>{c}</option>)}</select>
                      : <span className="badge badge-red" style={{ fontSize:12 }}>{txn.category||'—'}</span>}
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:8 }}>Project / Purpose</label>
                    {editing ? <input type="text" value={form.project_purpose} onChange={e=>set('project_purpose',e.target.value)} placeholder="e.g. Website development" style={inp} onFocus={focus} onBlur={blur} />
                      : <p style={{ fontSize:14, color:'var(--t1)' }}>{txn.project_purpose||'—'}</p>}
                  </div>
                </>
              )}
            </div>

            <div style={{ marginTop:18 }}>
              <label style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:8 }}>Description</label>
              {editing ? <input type="text" value={form.description} onChange={e=>set('description',e.target.value)} placeholder="What is this for?" style={inp} onFocus={focus} onBlur={blur} />
                : <p style={{ fontSize:14, color:txn.description?'var(--t1)':'var(--t4)' }}>{txn.description||'No description'}</p>}
            </div>
            <div style={{ marginTop:16 }}>
              <label style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:8 }}>Notes</label>
              {editing ? <textarea value={form.notes} onChange={e=>set('notes',e.target.value)} rows={3} placeholder="Additional context…" style={{...inp,resize:'none',fontFamily:'Inter,sans-serif'} as React.CSSProperties} onFocus={focus} onBlur={blur} />
                : <p style={{ fontSize:14, color:txn.notes?'var(--t2)':'var(--t4)', lineHeight:1.65 }}>{txn.notes||'No notes'}</p>}
            </div>
          </div>

          {/* Metadata */}
          <div className="glass" style={{ padding:'20px 24px' }}>
            <p className="section-label" style={{ marginBottom:16 }}>Record Metadata</p>
            {[
              {l:'Transaction ID', v:txn.id, mono:true},
              {l:'Created',        v:new Date(txn.created_at).toLocaleString('en-KE',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})},
              {l:'Last Updated',   v:new Date(txn.updated_at).toLocaleString('en-KE',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})},
              {l:'Type',           v:isIn?'Investment (Money In)':'Expense (Money Out)'},
            ].map(row=>(
              <div key={row.l} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ fontSize:12, color:'var(--t3)', fontWeight:500, flexShrink:0 }}>{row.l}</span>
                <span style={{ fontSize:12, color:'var(--t2)', textAlign:'right', fontFamily:row.mono?'monospace':undefined, wordBreak:'break-all' }}>{row.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: proof */}
        <div>
          <div className="glass" style={{ padding:'24px 24px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
              <p className="section-label">Proof / Evidence</p>
              {txn.proof_url && !editing && (
                <button onClick={handleDownload} disabled={downloading} className="btn btn-blue" style={{ padding:'7px 14px', fontSize:12 }}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  {downloading?'Downloading…':'Download'}
                </button>
              )}
            </div>

            {txn.proof_url ? (
              <>
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', marginBottom:14, background:'rgba(110,180,255,0.06)', border:'1px solid rgba(110,180,255,0.18)', borderRadius:11 }}>
                  <span style={{ fontSize:22 }}>{isImage?'🖼':'📄'}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, color:'#9fd0ff', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{txn.proof_filename||'Proof file'}</div>
                    <div style={{ fontSize:11, color:'var(--t3)' }}>{isImage?'Image':'Document'} · Click preview to load</div>
                  </div>
                </div>

                {!proofUrl ? (
                  <button onClick={()=>loadProof()} disabled={loadingProof} style={{
                    width:'100%', background:'rgba(255,255,255,0.02)', border:'2px dashed rgba(255,255,255,0.07)',
                    borderRadius:14, padding:'36px 20px', cursor:loadingProof?'wait':'pointer',
                    display:'flex', flexDirection:'column', alignItems:'center', gap:8,
                    transition:'all 0.18s',
                  }} className="preview-btn">
                    <span style={{ fontSize:32 }}>{loadingProof?'⏳':'🔍'}</span>
                    <span style={{ fontSize:13, fontWeight:600, color:'var(--t2)' }}>{loadingProof?'Loading…':'Click to Preview'}</span>
                    <span style={{ fontSize:11, color:'var(--t4)' }}>Opens inline — no page change</span>
                  </button>
                ) : isImage ? (
                  <div style={{ borderRadius:14, overflow:'hidden', border:'1px solid rgba(255,255,255,0.06)', marginBottom:10, background:'#04070f' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={proofUrl} alt="Transaction proof" style={{ width:'100%', display:'block', maxHeight:460, objectFit:'contain' }} />
                  </div>
                ) : (
                  <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:14, padding:'28px', textAlign:'center', marginBottom:10 }}>
                    <div style={{ fontSize:40, marginBottom:8 }}>📄</div>
                    <p style={{ fontSize:13, color:'var(--t2)' }}>PDF Document — download to view</p>
                  </div>
                )}

                {proofUrl && (
                  <div style={{ display:'flex', gap:8, marginTop:10 }}>
                    <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="btn btn-glass" style={{ flex:1, justifyContent:'center', fontSize:12, padding:'9px 12px', textDecoration:'none' }}>
                      ↗ Open in New Tab
                    </a>
                    <button onClick={handleDownload} disabled={downloading} className="btn btn-blue" style={{ flex:1, fontSize:12, padding:'9px 12px' }}>
                      <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                      {downloading?'Saving…':'Download'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign:'center', padding:'36px 20px' }}>
                <div style={{ fontSize:40, marginBottom:10, opacity:0.4 }}>📭</div>
                <p style={{ fontSize:14, color:'var(--t3)', marginBottom:4 }}>No proof uploaded</p>
                <p style={{ fontSize:12, color:'var(--t4)' }}>Edit this transaction to attach a receipt or screenshot</p>
              </div>
            )}

            {editing && (
              <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                <label style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:8 }}>{txn.proof_url?'Replace Proof':'Upload Proof'}</label>
                <label style={{
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6,
                  height:80, border:`2px dashed ${newProofFile?accent:'rgba(255,255,255,0.08)'}`,
                  borderRadius:12, cursor:'pointer', background:newProofFile?`${isIn?'rgba(14,207,142,0.06)':'rgba(255,107,138,0.05)'}`:' rgba(255,255,255,0.01)',
                  transition:'all 0.18s',
                }}>
                  {newProofFile ? <div style={{ fontSize:13, color:accent, fontWeight:700 }}>✓ {newProofFile.name}</div>
                    : <div style={{ fontSize:13, color:'var(--t3)' }}>📎 Tap to select file</div>}
                  <input type="file" style={{ display:'none' }} accept="image/*,application/pdf" onChange={e=>setNewProofFile(e.target.files?.[0]||null)} />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete modal */}
      {confirmDelete && (
        <div className="fade-in" style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(8px)' }}>
          <div className="glass card-in" style={{ maxWidth:380, width:'100%', padding:'32px 28px' }}>
            <div style={{ textAlign:'center', marginBottom:22 }}>
              <div style={{ fontSize:40, marginBottom:14 }}>⚠️</div>
              <h3 style={{ fontFamily:'Manrope,sans-serif', fontSize:20, fontWeight:900, color:'#f0f6ff', marginBottom:10 }}>Delete Transaction?</h3>
              <p style={{ fontSize:14, color:'var(--t3)', lineHeight:1.65 }}>
                This permanently removes the{' '}
                <strong style={{ color:accent }}>{isIn?'+':'-'}{formatCurrency(txn.amount)}</strong>{' '}
                entry from {formatDate(txn.date)}. Cannot be undone.
              </p>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>setConfirmDelete(false)} className="btn btn-glass" style={{ flex:1 }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="btn btn-danger" style={{ flex:1, background:'linear-gradient(135deg,#ff6b8a,#e53e6a)', color:'white', border:'none', boxShadow:'0 4px 16px rgba(255,107,138,0.28)' }}>
                {deleting?'Deleting…':'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        #detail-grid { grid-template-columns:1fr; }
        @media (min-width:900px) { #detail-grid { grid-template-columns:1fr 360px; } }
        #fields-grid { grid-template-columns:1fr 1fr; }
        @media (max-width:500px) { #fields-grid { grid-template-columns:1fr !important; } }
        .back-btn:hover  { color:var(--t2) !important; }
        .preview-btn:hover { border-color:rgba(255,255,255,0.14) !important; background:rgba(255,255,255,0.025) !important; }
        option { background:#0a1020; color:#f0f6ff; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter:invert(0.5); }
      `}</style>
    </div>
  )
}
