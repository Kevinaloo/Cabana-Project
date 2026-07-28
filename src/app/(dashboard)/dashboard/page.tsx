import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction } from '@/types'

async function getStats(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: txns } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  const totalIn = txns?.filter(t => t.type === 'money_in').reduce((sum, t) => sum + t.amount, 0) ?? 0
  const totalOut = txns?.filter(t => t.type === 'money_out').reduce((sum, t) => sum + t.amount, 0) ?? 0
  const balance = totalIn - totalOut
  const count = txns?.length ?? 0
  const recent = txns?.slice(0, 8) ?? []

  return { totalIn, totalOut, balance, count, recent }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { totalIn, totalOut, balance, count, recent } = await getStats(supabase)

  const utilizationPct = totalIn > 0 ? Math.min((totalOut / totalIn) * 100, 100) : 0
  const remainingPct = totalIn > 0 ? Math.min((balance / totalIn) * 100, 100) : 0

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0, letterSpacing: '-0.4px' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 14, color: '#475569', marginTop: 4 }}>
          Overview of Cabana investment activity
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 20 }} className="stats-grid">
        {/* Total In */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.08) 100%)',
          border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: 16, padding: '18px 16px'
        }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>📈</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981', marginBottom: 4, letterSpacing: '-0.5px' }}>
            {formatCurrency(totalIn)}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Total Investment Received</div>
        </div>

        {/* Total Out */}
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 16, padding: '18px 16px'
        }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>📉</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#f87171', marginBottom: 4, letterSpacing: '-0.5px' }}>
            {formatCurrency(totalOut)}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Total Money Spent</div>
        </div>

        {/* Balance */}
        <div style={{
          background: balance >= 0
            ? 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(37,99,235,0.06) 100%)'
            : 'rgba(245,158,11,0.08)',
          border: `1px solid ${balance >= 0 ? 'rgba(59,130,246,0.25)' : 'rgba(245,158,11,0.25)'}`,
          borderRadius: 16, padding: '18px 16px'
        }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>💰</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: balance >= 0 ? '#60a5fa' : '#fbbf24', marginBottom: 4, letterSpacing: '-0.5px' }}>
            {formatCurrency(balance)}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Current Balance</div>
        </div>

        {/* Transactions */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: '18px 16px'
        }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>🔄</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#94a3b8', marginBottom: 4, letterSpacing: '-0.5px' }}>
            {count}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Total Transactions</div>
        </div>
      </div>

      {/* Fund Utilization */}
      {totalIn > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: '20px', marginBottom: 20
        }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: '#64748b', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Fund Utilization
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>Spent</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#f87171' }}>{utilizationPct.toFixed(1)}%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                <div style={{ width: `${utilizationPct}%`, height: '100%', background: 'linear-gradient(90deg, #ef4444, #f87171)', borderRadius: 999, transition: 'width 0.6s ease' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>Remaining</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#10b981' }}>{remainingPct.toFixed(1)}%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                <div style={{ width: `${Math.max(remainingPct, 0)}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: 999, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, overflow: 'hidden'
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>Recent Activity</h2>
          <span style={{ fontSize: 12, color: '#475569' }}>{recent.length} latest</span>
        </div>
        {recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
            <p style={{ fontSize: 14, color: '#475569' }}>No transactions yet. Add your first via Money In or Money Out.</p>
          </div>
        ) : (
          <div>
            {recent.map((t: Transaction, i) => (
              <Link key={t.id} href={`/transactions/${t.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 20px',
                  borderBottom: i < recent.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  cursor: 'pointer', transition: 'background 0.15s',
                }} className="dash-row">
                  {/* Icon */}
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: t.type === 'money_in' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)',
                    fontSize: 16, fontWeight: 700,
                    color: t.type === 'money_in' ? '#10b981' : '#f87171'
                  }}>
                    {t.type === 'money_in' ? '↑' : '↓'}
                  </div>
                  {/* Main info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.description || (t.type === 'money_in' ? t.payment_method : t.category) || '—'}
                      </div>
                      {t.proof_url && <span style={{ fontSize: 10, color: '#60a5fa', flexShrink: 0 }}>📎</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: '#475569' }}>{formatDate(t.date)}</span>
                      {(t.payment_method || t.category) && (
                        <span style={{ fontSize: 11, color: '#334155', background: 'rgba(255,255,255,0.04)', padding: '1px 7px', borderRadius: 4 }}>
                          {t.payment_method || t.category}
                        </span>
                      )}
                      {t.reference_number && (
                        <span style={{ fontSize: 11, color: '#334155', fontFamily: 'monospace' }}>
                          {t.reference_number}
                        </span>
                      )}
                      {t.project_purpose && (
                        <span style={{ fontSize: 11, color: '#334155' }}>{t.project_purpose}</span>
                      )}
                    </div>
                  </div>
                  {/* Amount + arrow */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.type === 'money_in' ? '#10b981' : '#f87171' }}>
                      {t.type === 'money_in' ? '+' : '-'}{formatCurrency(t.amount)}
                    </div>
                    <div style={{ fontSize: 11, color: '#334155', marginTop: 2 }}>→</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 640px) {
          .stats-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
        .dash-row:hover { background: rgba(255,255,255,0.04) !important; }
      `}</style>
    </div>
  )
}
