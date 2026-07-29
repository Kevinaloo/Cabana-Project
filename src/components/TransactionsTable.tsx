'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { TransactionWithBalance } from '@/types'

interface Props { transactions: TransactionWithBalance[] }

export default function TransactionsTable({ transactions }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all'|'money_in'|'money_out'>('all')

  const filtered = useMemo(() => transactions.filter(t => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false
    if (dateFrom && t.date < dateFrom) return false
    if (dateTo && t.date > dateTo) return false
    if (search) {
      const q = search.toLowerCase()
      return ['description','category','payment_method','reference_number','project_purpose','notes']
        .some(k => (t[k as keyof typeof t] as string || '').toLowerCase().includes(q))
    }
    return true
  }), [transactions, search, dateFrom, dateTo, typeFilter])

  const hasFilters = search || dateFrom || dateTo || typeFilter !== 'all'

  const inp: React.CSSProperties = {
    background: 'rgba(15,23,42,0.8)', border: '1.5px solid rgba(51,65,85,0.6)',
    borderRadius: 10, padding: '9px 13px', fontSize: 13, color: '#f8fafc',
    outline: 'none', fontFamily: 'Inter,sans-serif',
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>

      {/* Filter bar */}
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#334155' }} width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" placeholder="Search description, category, reference, notes…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inp, width: '100%', boxSizing: 'border-box', paddingLeft: 36 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as typeof typeFilter)} style={{ ...inp, cursor: 'pointer' }}>
            <option value="all">All Types</option>
            <option value="money_in">↑ Money In</option>
            <option value="money_out">↓ Money Out</option>
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} title="From date" style={inp} />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} title="To date" style={inp} />
          {hasFilters && (
            <button onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setTypeFilter('all') }}
              style={{ ...inp, cursor: 'pointer', color: '#64748b', border: '1.5px solid rgba(51,65,85,0.4)' }}>
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Count + hint */}
      <div style={{ padding: '9px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</span>
        <span style={{ fontSize: 11, color: 'var(--text-4)' }}>· Click any row for full details</span>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
          <p style={{ fontSize: 14, color: 'var(--text-3)' }}>No transactions found</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div id="txn-table-desktop" style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {['Date','Type','Amount','Method · Category','Description','Ref · Project','Proof','Running Bal'].map(h => (
                    <th key={h} style={{ textAlign: h === 'Running Bal' || h === 'Amount' ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="clickable" onClick={() => router.push(`/transactions/${t.id}`)}>
                    <td style={{ color: 'var(--text-3)', fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(t.date)}</td>
                    <td>
                      <span className={`badge ${t.type === 'money_in' ? 'badge-green' : 'badge-red'}`}>
                        {t.type === 'money_in' ? '↑ In' : '↓ Out'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="num" style={{ fontWeight: 700, color: t.type === 'money_in' ? '#34d399' : '#fca5a5' }}>
                        {t.type === 'money_in' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-2)', fontSize: 12 }}>{t.payment_method || t.category || <span style={{color:'var(--text-4)'}}>—</span>}</td>
                    <td style={{ color: 'var(--text-2)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>
                      {t.description || <span style={{color:'var(--text-4)'}}>—</span>}
                    </td>
                    <td style={{ color: 'var(--text-3)', fontSize: 11, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: t.reference_number ? 'monospace' : undefined }}>
                      {t.reference_number || t.project_purpose || <span style={{color:'var(--text-4)'}}>—</span>}
                    </td>
                    <td>
                      {t.proof_url
                        ? <span className="badge badge-blue" style={{ fontSize: 10 }}>📎 Proof</span>
                        : <span style={{ color: 'var(--text-4)', fontSize: 11 }}>—</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="num" style={{ fontWeight: 700, fontSize: 13, color: t.running_balance >= 0 ? '#93c5fd' : '#fcd34d' }}>
                        {formatCurrency(t.running_balance)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div id="txn-cards-mobile" style={{ display: 'none', flexDirection: 'column' }}>
            {filtered.map(t => (
              <div key={t.id} onClick={() => router.push(`/transactions/${t.id}`)}
                style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'background 0.12s' }}
                className="mobile-card"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <span className={`badge ${t.type === 'money_in' ? 'badge-green' : 'badge-red'}`} style={{ alignSelf: 'flex-start' }}>
                      {t.type === 'money_in' ? '↑ In' : '↓ Out'}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{formatDate(t.date)}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="num" style={{ fontSize: 17, fontWeight: 800, color: t.type === 'money_in' ? '#34d399' : '#fca5a5', letterSpacing: '-0.3px' }}>
                      {t.type === 'money_in' ? '+' : '-'}{formatCurrency(t.amount)}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 2 }}>
                      Bal: <span className="num" style={{ color: t.running_balance >= 0 ? '#93c5fd' : '#fcd34d', fontWeight: 700 }}>{formatCurrency(t.running_balance)}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  {(t.payment_method || t.category) && (
                    <span style={{ fontSize: 11, color: 'var(--text-3)', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 6 }}>
                      {t.payment_method || t.category}
                    </span>
                  )}
                  {t.description && <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{t.description}</span>}
                  {t.proof_url && <span className="badge badge-blue" style={{ fontSize: 10 }}>📎</span>}
                  <span style={{ fontSize: 11, color: 'var(--text-4)', marginLeft: 'auto' }}>Tap to view →</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 640px) {
          #txn-table-desktop { display: none !important; }
          #txn-cards-mobile { display: flex !important; }
        }
        .mobile-card:hover { background: rgba(255,255,255,0.025) !important; }
        option { background: #111827; color: #f8fafc; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
      `}</style>
    </div>
  )
}
