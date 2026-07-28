'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { TransactionWithBalance } from '@/types'

interface Props { transactions: TransactionWithBalance[] }

const inputStyle: React.CSSProperties = {
  background: 'rgba(30,41,59,0.8)', border: '1.5px solid rgba(51,65,85,0.7)',
  borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#f1f5f9',
  outline: 'none',
}

export default function TransactionsTable({ transactions }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'money_in' | 'money_out'>('all')

  const filtered = useMemo(() => transactions.filter(t => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false
    if (dateFrom && t.date < dateFrom) return false
    if (dateTo && t.date > dateTo) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        (t.description || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q) ||
        (t.payment_method || '').toLowerCase().includes(q) ||
        (t.reference_number || '').toLowerCase().includes(q) ||
        (t.project_purpose || '').toLowerCase().includes(q) ||
        (t.notes || '').toLowerCase().includes(q)
      )
    }
    return true
  }), [transactions, search, dateFrom, dateTo, typeFilter])

  const hasFilters = search || dateFrom || dateTo || typeFilter !== 'all'

  function goToDetail(id: string) {
    router.push(`/transactions/${id}`)
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>

      {/* Filters */}
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          type="text" placeholder="Search by description, category, reference, notes…" value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as typeof typeFilter)}
            style={{ ...inputStyle, padding: '9px 12px', cursor: 'pointer' }}>
            <option value="all">All Types</option>
            <option value="money_in">Money In</option>
            <option value="money_out">Money Out</option>
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            title="From date" style={{ ...inputStyle, padding: '9px 12px' }} />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            title="To date" style={{ ...inputStyle, padding: '9px 12px' }} />
          {hasFilters && (
            <button onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setTypeFilter('all') }}
              style={{ ...inputStyle, padding: '9px 16px', cursor: 'pointer', color: '#94a3b8' }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Count */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</span>
        <span style={{ color: '#1e293b' }}>·</span>
        <span style={{ color: '#334155' }}>Click any row to view full details</span>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
          <p style={{ fontSize: 14, color: '#475569' }}>No transactions found</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="txn-table" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Date', 'Type', 'Amount', 'Method / Category', 'Description', 'Ref / Project', 'Proof', 'Balance'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: h === 'Balance' ? 'right' : 'left',
                      fontSize: 11, fontWeight: 600, color: '#475569',
                      textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr
                    key={t.id}
                    onClick={() => goToDetail(t.id)}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    className="txn-row"
                  >
                    <td style={{ padding: '14px 16px', color: '#94a3b8', whiteSpace: 'nowrap', fontSize: 13 }}>{formatDate(t.date)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                        background: t.type === 'money_in' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)',
                        color: t.type === 'money_in' ? '#10b981' : '#f87171',
                      }}>
                        {t.type === 'money_in' ? '↑ In' : '↓ Out'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, whiteSpace: 'nowrap', color: t.type === 'money_in' ? '#10b981' : '#f87171' }}>
                      {t.type === 'money_in' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: 13 }}>
                      {t.payment_method || t.category || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#94a3b8', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>
                      {t.description || <span style={{ color: '#334155' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: 12, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.reference_number || t.project_purpose || <span style={{ color: '#334155' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {t.proof_url
                        ? <span style={{ fontSize: 13, color: '#60a5fa' }}>📎 View</span>
                        : <span style={{ color: '#334155', fontSize: 12 }}>—</span>
                      }
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap', color: t.running_balance >= 0 ? '#60a5fa' : '#f59e0b' }}>
                      {formatCurrency(t.running_balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="txn-cards" style={{ display: 'none', flexDirection: 'column', gap: 1 }}>
            {filtered.map(t => (
              <div
                key={t.id}
                onClick={() => goToDetail(t.id)}
                style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                className="txn-card-mobile"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600, marginBottom: 5,
                      background: t.type === 'money_in' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)',
                      color: t.type === 'money_in' ? '#10b981' : '#f87171',
                    }}>
                      {t.type === 'money_in' ? '↑ In' : '↓ Out'}
                    </span>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{formatDate(t.date)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: t.type === 'money_in' ? '#10b981' : '#f87171' }}>
                      {t.type === 'money_in' ? '+' : '-'}{formatCurrency(t.amount)}
                    </div>
                    <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                      Bal: <span style={{ color: t.running_balance >= 0 ? '#60a5fa' : '#f59e0b', fontWeight: 600 }}>{formatCurrency(t.running_balance)}</span>
                    </div>
                  </div>
                </div>
                {/* Key details row */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                  {(t.payment_method || t.category) && (
                    <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.05)', color: '#64748b', padding: '2px 8px', borderRadius: 6 }}>
                      {t.payment_method || t.category}
                    </span>
                  )}
                  {t.description && (
                    <span style={{ fontSize: 11, color: '#64748b' }}>{t.description}</span>
                  )}
                  {t.proof_url && (
                    <span style={{ fontSize: 11, color: '#60a5fa' }}>📎 Proof</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#334155', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  Tap to view details →
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 640px) {
          .txn-table { display: none !important; }
          .txn-cards { display: flex !important; }
        }
        .txn-row:hover { background: rgba(255,255,255,0.04) !important; }
        .txn-card-mobile:hover { background: rgba(255,255,255,0.03) !important; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6); }
        option { background: #1e293b; color: #f1f5f9; }
      `}</style>
    </div>
  )
}
