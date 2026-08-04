import { createClient } from '@/lib/supabase/server'
import TransactionsTable from '@/components/TransactionsTable'
import type { Transaction } from '@/types'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('transactions').select('*')
    .order('date',{ascending:true}).order('created_at',{ascending:true})

  let running = 0
  const withBalance = (data ?? []).map((t:Transaction) => {
    running += t.type === 'money_in' ? t.amount : -t.amount
    return { ...t, running_balance: running }
  }).reverse()

  return (
    <div className="page-in" style={{ paddingBottom:48 }}>
      <div style={{ marginBottom:28 }}>
        <p className="section-label" style={{ marginBottom:6 }}>History</p>
        <h1 style={{ fontFamily:'Manrope,sans-serif', fontSize:28, fontWeight:900, color:'#f0f6ff', letterSpacing:'-0.6px', marginBottom:8 }}>
          Transaction History
        </h1>
        <p style={{ color:'var(--t3)', fontSize:13.5 }}>Every money movement — searchable, filterable, and fully auditable. Click any row for complete details.</p>
      </div>
      <TransactionsTable transactions={withBalance} />
    </div>
  )
}
