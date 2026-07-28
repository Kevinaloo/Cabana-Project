import { createClient } from '@/lib/supabase/server'
import ReportsClient from '@/components/ReportsClient'
import type { Transaction } from '@/types'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: transactions } = await supabase
    .from('finance_transactions').select('*').order('date', { ascending: true })

  let running = 0
  const withBalance = (transactions ?? []).map((t: Transaction) => {
    if (t.type === 'money_in') running += t.amount
    else running -= t.amount
    return { ...t, running_balance: running }
  })

  const totalIn = (transactions ?? []).filter((t: Transaction) => t.type === 'money_in').reduce((s: number, t: Transaction) => s + t.amount, 0)
  const totalOut = (transactions ?? []).filter((t: Transaction) => t.type === 'money_out').reduce((s: number, t: Transaction) => s + t.amount, 0)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0, letterSpacing: '-0.4px' }}>
          Reports
        </h1>
        <p style={{ fontSize: 14, color: '#475569', marginTop: 4 }}>
          Export all transaction data
        </p>
      </div>
      <ReportsClient transactions={withBalance} totalIn={totalIn} totalOut={totalOut} balance={totalIn - totalOut} />
    </div>
  )
}
