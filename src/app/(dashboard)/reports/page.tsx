import { createClient } from '@/lib/supabase/server'
import ReportsClient from '@/components/ReportsClient'
import type { Transaction } from '@/types'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: true })

  // Compute running balances
  let running = 0
  const withBalance = (transactions ?? []).map((t: Transaction) => {
    if (t.type === 'money_in') running += t.amount
    else running -= t.amount
    return { ...t, running_balance: running }
  })

  const totalIn = (transactions ?? []).filter((t: Transaction) => t.type === 'money_in').reduce((s: number, t: Transaction) => s + t.amount, 0)
  const totalOut = (transactions ?? []).filter((t: Transaction) => t.type === 'money_out').reduce((s: number, t: Transaction) => s + t.amount, 0)

  return (
    <div className="pt-14 md:pt-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-500 text-sm mt-1">Export all transaction data</p>
      </div>
      <ReportsClient
        transactions={withBalance}
        totalIn={totalIn}
        totalOut={totalOut}
        balance={totalIn - totalOut}
      />
    </div>
  )
}
