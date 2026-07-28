import { createClient } from '@/lib/supabase/server'
import TransactionsTable from '@/components/TransactionsTable'
import type { Transaction } from '@/types'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: transactions } = await supabase
    .from('finance_transactions').select('*')
    .order('date', { ascending: true })
    .order('created_at', { ascending: true })

  let running = 0
  const withBalance = (transactions ?? []).map((t: Transaction) => {
    if (t.type === 'money_in') running += t.amount
    else running -= t.amount
    return { ...t, running_balance: running }
  }).reverse()

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0, letterSpacing: '-0.4px' }}>
          Transaction History
        </h1>
        <p style={{ fontSize: 14, color: '#475569', marginTop: 4 }}>
          All money in and money out with running balance
        </p>
      </div>
      <TransactionsTable transactions={withBalance} />
    </div>
  )
}
