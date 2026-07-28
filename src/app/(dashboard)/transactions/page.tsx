import { createClient } from '@/lib/supabase/server'
import TransactionsTable from '@/components/TransactionsTable'
import type { Transaction } from '@/types'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: true })
    .order('created_at', { ascending: true })

  // Compute running balance
  let running = 0
  const withBalance = (transactions ?? []).map((t: Transaction) => {
    if (t.type === 'money_in') running += t.amount
    else running -= t.amount
    return { ...t, running_balance: running }
  }).reverse() // Show newest first

  return (
    <div className="pt-14 md:pt-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Transaction History</h1>
        <p className="text-slate-500 text-sm mt-1">All money in and money out with running balance</p>
      </div>
      <TransactionsTable transactions={withBalance} />
    </div>
  )
}
