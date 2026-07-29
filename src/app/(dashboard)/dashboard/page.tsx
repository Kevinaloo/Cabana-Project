import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: txns } = await supabase
    .from('transactions').select('*')
    .order('date', { ascending: true })
    .order('created_at', { ascending: true })

  const allTxns: Transaction[] = txns ?? []

  // Compute running balances
  let running = 0
  const withBalance = allTxns.map(t => {
    running += t.type === 'money_in' ? t.amount : -t.amount
    return { ...t, running_balance: running }
  })

  const totalIn  = allTxns.filter(t => t.type === 'money_in').reduce((s, t) => s + t.amount, 0)
  const totalOut = allTxns.filter(t => t.type === 'money_out').reduce((s, t) => s + t.amount, 0)
  const balance  = totalIn - totalOut
  const count    = allTxns.length
  const recent   = [...withBalance].reverse().slice(0, 8)

  const spentPct     = totalIn > 0 ? Math.min((totalOut / totalIn) * 100, 100) : 0
  const remainingPct = totalIn > 0 ? Math.max(Math.min((balance / totalIn) * 100, 100), 0) : 0

  // Category breakdown
  const catMap: Record<string, number> = {}
  allTxns.filter(t => t.type === 'money_out').forEach(t => {
    const key = t.category || 'Other'
    catMap[key] = (catMap[key] || 0) + t.amount
  })
  const cats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="page-enter" style={{ paddingBottom: 40 }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 28 }}>
        <p className="section-label" style={{ marginBottom: 6 }}>Overview</p>
        <h1 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 28, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.6px', lineHeight: 1.1 }}>
          Investment Dashboard
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: 14, marginTop: 5 }}>
          Full transparency on every shilling invested and spent
        </p>
      </div>

      {/* ── KPI cards ── */}
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 16 }} id="kpi-grid">
        {/* Total In */}
        <div className="card card-enter card-green" style={{ padding: '20px 18px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)' }} />
          <div style={{ fontSize: 22, marginBottom: 10 }}>📈</div>
          <div className="stat-num" style={{ fontSize: 26, color: '#34d399', marginBottom: 5 }}>{formatCurrency(totalIn)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>Total Investment Received</div>
          <div style={{ fontSize: 11, color: '#10b981', marginTop: 4, fontWeight: 500 }}>{allTxns.filter(t=>t.type==='money_in').length} deposit{allTxns.filter(t=>t.type==='money_in').length !== 1 ? 's' : ''}</div>
        </div>

        {/* Total Out */}
        <div className="card card-enter card-red" style={{ padding: '20px 18px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: 'radial-gradient(circle, rgba(248,113,113,0.10) 0%, transparent 70%)' }} />
          <div style={{ fontSize: 22, marginBottom: 10 }}>📉</div>
          <div className="stat-num" style={{ fontSize: 26, color: '#fca5a5', marginBottom: 5 }}>{formatCurrency(totalOut)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>Total Money Spent</div>
          <div style={{ fontSize: 11, color: '#f87171', marginTop: 4, fontWeight: 500 }}>{allTxns.filter(t=>t.type==='money_out').length} expense{allTxns.filter(t=>t.type==='money_out').length !== 1 ? 's' : ''}</div>
        </div>

        {/* Balance */}
        <div className="card card-enter" style={{
          padding: '20px 18px', position: 'relative', overflow: 'hidden',
          background: balance >= 0
            ? 'linear-gradient(135deg, rgba(96,165,250,0.07) 0%, rgba(59,130,246,0.03) 100%)'
            : 'linear-gradient(135deg, rgba(251,191,36,0.07) 0%, rgba(245,158,11,0.03) 100%)',
          border: `1px solid ${balance >= 0 ? 'rgba(96,165,250,0.2)' : 'rgba(251,191,36,0.2)'}`,
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: `radial-gradient(circle, ${balance >= 0 ? 'rgba(96,165,250,0.1)' : 'rgba(251,191,36,0.1)'} 0%, transparent 70%)` }} />
          <div style={{ fontSize: 22, marginBottom: 10 }}>💰</div>
          <div className="stat-num" style={{ fontSize: 26, color: balance >= 0 ? '#93c5fd' : '#fcd34d', marginBottom: 5 }}>{formatCurrency(balance)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>Current Balance</div>
          <div style={{ fontSize: 11, color: balance >= 0 ? '#60a5fa' : '#fbbf24', marginTop: 4, fontWeight: 500 }}>
            {remainingPct.toFixed(1)}% of funds remaining
          </div>
        </div>

        {/* Count */}
        <div className="card card-enter" style={{ padding: '20px 18px', position: 'relative', overflow: 'hidden', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />
          <div style={{ fontSize: 22, marginBottom: 10 }}>🔄</div>
          <div className="stat-num" style={{ fontSize: 26, color: '#cbd5e1', marginBottom: 5 }}>{count}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>Total Transactions</div>
          <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4, fontWeight: 500 }}>
            Across {new Set(allTxns.map(t=>t.date.slice(0,7))).size} month{new Set(allTxns.map(t=>t.date.slice(0,7))).size !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* ── Fund utilization ── */}
      {totalIn > 0 && (
        <div className="card card-enter" style={{ padding: '22px 22px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <p className="section-label" style={{ marginBottom: 3 }}>Fund Utilization</p>
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>How the investment is being deployed</p>
            </div>
            <Link href="/reports" style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 12, color: '#10b981', textDecoration: 'none', fontWeight: 600,
              padding: '5px 12px', borderRadius: 8,
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)',
            }}>
              Export →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Deployed (Spent)', pct: spentPct, color: '#f87171', glow: 'rgba(248,113,113,0.25)', amount: totalOut },
              { label: 'Available (Balance)', pct: remainingPct, color: '#10b981', glow: 'rgba(16,185,129,0.25)', amount: balance },
            ].map(row => (
              <div key={row.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>{row.label}</span>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                    <span className="num" style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>{formatCurrency(row.amount)}</span>
                    <span style={{ fontSize: 12, color: row.color, fontWeight: 700, minWidth: 38, textAlign: 'right' }}>{row.pct.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="progress-track" style={{ height: 7 }}>
                  <div className="progress-fill" style={{ width: `${row.pct}%`, background: `linear-gradient(90deg, ${row.color}, ${row.color}cc)`, boxShadow: `0 0 8px ${row.glow}` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Two column: recent + breakdown ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }} id="bottom-grid">

        {/* Recent Activity */}
        <div className="card card-enter" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p className="section-label" style={{ marginBottom: 2 }}>Recent Activity</p>
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Latest {recent.length} transactions</p>
            </div>
            <Link href="/transactions" style={{
              fontSize: 12, color: '#64748b', textDecoration: 'none', fontWeight: 600,
              padding: '5px 12px', borderRadius: 8,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            }}>
              View all →
            </Link>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

          {recent.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
              <p style={{ fontSize: 14, color: 'var(--text-3)' }}>No transactions yet.</p>
              <p style={{ fontSize: 13, color: 'var(--text-4)', marginTop: 4 }}>Add your first investment via Money In.</p>
            </div>
          ) : (
            <div className="stagger">
              {recent.map((t, i) => (
                <Link key={t.id} href={`/transactions/${t.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div className="dash-row" style={{
                    display: 'flex', alignItems: 'center', gap: 13,
                    padding: '13px 20px',
                    borderBottom: i < recent.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                    cursor: 'pointer', transition: 'background 0.12s',
                  }}>
                    {/* Icon */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: t.type === 'money_in' ? 'rgba(16,185,129,0.12)' : 'rgba(248,113,113,0.10)',
                      border: `1px solid ${t.type === 'money_in' ? 'rgba(16,185,129,0.2)' : 'rgba(248,113,113,0.18)'}`,
                      color: t.type === 'money_in' ? '#10b981' : '#f87171',
                      fontSize: 16, fontWeight: 700,
                    }}>
                      {t.type === 'money_in' ? '↑' : '↓'}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.description || t.payment_method || t.category || '—'}
                        </span>
                        {t.proof_url && (
                          <span style={{ fontSize: 10, background: 'rgba(96,165,250,0.12)', color: '#93c5fd', padding: '1px 6px', borderRadius: 5, fontWeight: 600, flexShrink: 0 }}>
                            📎 PROOF
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{formatDate(t.date)}</span>
                        {(t.payment_method || t.category) && (
                          <span style={{ fontSize: 11, color: 'var(--text-4)', background: 'rgba(255,255,255,0.04)', padding: '1px 7px', borderRadius: 5, fontWeight: 500 }}>
                            {t.payment_method || t.category}
                          </span>
                        )}
                        {t.reference_number && (
                          <span style={{ fontSize: 11, color: 'var(--text-4)', fontFamily: 'monospace' }}>{t.reference_number}</span>
                        )}
                        {t.project_purpose && (
                          <span style={{ fontSize: 11, color: 'var(--text-4)' }}>{t.project_purpose}</span>
                        )}
                      </div>
                    </div>

                    {/* Amount + balance */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div className="num" style={{ fontSize: 14, fontWeight: 700, color: t.type === 'money_in' ? '#34d399' : '#fca5a5' }}>
                        {t.type === 'money_in' ? '+' : '-'}{formatCurrency(t.amount)}
                      </div>
                      <div className="num" style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 2 }}>
                        Bal: {formatCurrency(t.running_balance)}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div style={{ color: 'var(--text-4)', fontSize: 14, flexShrink: 0 }}>›</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Spending breakdown */}
        {cats.length > 0 && (
          <div className="card card-enter" style={{ padding: '20px 22px' }}>
            <p className="section-label" style={{ marginBottom: 3 }}>Spending by Category</p>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 18 }}>Where the money is going</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {cats.map(([cat, amt]) => {
                const pct = totalOut > 0 ? (amt / totalOut) * 100 : 0
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>{cat}</span>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <span className="num" style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>{formatCurrency(amt)}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-3)', minWidth: 34, textAlign: 'right' }}>{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="progress-track" style={{ height: 5 }}>
                      <div className="progress-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #f87171, #ef4444)' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        #kpi-grid { grid-template-columns: repeat(2,1fr); }
        @media (min-width: 900px) {
          #kpi-grid { grid-template-columns: repeat(4,1fr); }
          #bottom-grid { grid-template-columns: 1fr 340px; }
        }
        .dash-row:hover { background: rgba(255,255,255,0.03) !important; }
      `}</style>
    </div>
  )
}
