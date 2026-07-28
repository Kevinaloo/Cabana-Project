import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction } from '@/types'

async function getStats(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: txns } = await supabase
    .from('transactions')
    .select('type, amount, date, description, category, payment_method')
    .order('date', { ascending: false })

  const totalIn = txns?.filter(t => t.type === 'money_in').reduce((sum, t) => sum + t.amount, 0) ?? 0
  const totalOut = txns?.filter(t => t.type === 'money_out').reduce((sum, t) => sum + t.amount, 0) ?? 0
  const balance = totalIn - totalOut
  const count = txns?.length ?? 0
  const recent = txns?.slice(0, 5) ?? []

  return { totalIn, totalOut, balance, count, recent }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { totalIn, totalOut, balance, count, recent } = await getStats(supabase)

  const stats = [
    {
      label: 'Total Investment Received',
      value: formatCurrency(totalIn),
      icon: '📈',
      color: 'bg-emerald-50 border-emerald-100',
      valueColor: 'text-emerald-700',
    },
    {
      label: 'Total Money Spent',
      value: formatCurrency(totalOut),
      icon: '📉',
      color: 'bg-red-50 border-red-100',
      valueColor: 'text-red-700',
    },
    {
      label: 'Current Balance',
      value: formatCurrency(balance),
      icon: '💰',
      color: balance >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100',
      valueColor: balance >= 0 ? 'text-blue-700' : 'text-orange-700',
    },
    {
      label: 'Transactions',
      value: count.toString(),
      icon: '🔄',
      color: 'bg-slate-50 border-slate-200',
      valueColor: 'text-slate-700',
    },
  ]

  return (
    <div className="pt-14 md:pt-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of Cabana investment activity</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className={`rounded-2xl border p-4 md:p-5 ${stat.color}`}>
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className={`text-xl md:text-2xl font-bold ${stat.valueColor} mb-1`}>
              {stat.value}
            </div>
            <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Balance bar */}
      {totalIn > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Fund Utilization</h2>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs text-slate-500 w-20 shrink-0">Spent</span>
            <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${Math.min((totalOut / totalIn) * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-700 w-12 text-right">
              {totalIn > 0 ? ((totalOut / totalIn) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-20 shrink-0">Remaining</span>
            <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all"
                style={{ width: `${Math.min((balance / totalIn) * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-emerald-700 w-12 text-right">
              {totalIn > 0 ? ((balance / totalIn) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Recent Activity</h2>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm">No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recent.map((t: { type: string; amount: number; date: string; description?: string; category?: string; payment_method?: string }, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  t.type === 'money_in' ? 'bg-emerald-50' : 'bg-red-50'
                }`}>
                  <span className="text-base">{t.type === 'money_in' ? '↑' : '↓'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">
                    {t.description || (t.type === 'money_in' ? t.payment_method : t.category) || '—'}
                  </div>
                  <div className="text-xs text-slate-400">{formatDate(t.date)}</div>
                </div>
                <div className={`text-sm font-semibold ${
                  t.type === 'money_in' ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {t.type === 'money_in' ? '+' : '-'}{formatCurrency(t.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
