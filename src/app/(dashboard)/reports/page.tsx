import { createClient } from '@/lib/supabase/server'
import ReportsClient from '@/components/ReportsClient'
import type { Transaction } from '@/types'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('transactions').select('*').order('date',{ascending:true})
  let running = 0
  const withBalance = (data??[]).map((t:Transaction) => {
    running += t.type==='money_in' ? t.amount : -t.amount
    return { ...t, running_balance: running }
  })
  const totalIn  = (data??[]).filter((t:Transaction)=>t.type==='money_in').reduce((s:number,t:Transaction)=>s+t.amount,0)
  const totalOut = (data??[]).filter((t:Transaction)=>t.type==='money_out').reduce((s:number,t:Transaction)=>s+t.amount,0)

  return (
    <div className="page-in" style={{ paddingBottom:48 }}>
      <div style={{ marginBottom:28 }}>
        <p className="section-label" style={{ marginBottom:6 }}>Export</p>
        <h1 style={{ fontFamily:'Manrope,sans-serif', fontSize:28, fontWeight:900, color:'#f0f6ff', letterSpacing:'-0.6px', marginBottom:8 }}>
          Reports & Export
        </h1>
        <p style={{ color:'var(--t3)', fontSize:13.5 }}>Download the full investment record in Excel, CSV, or PDF format for investor review.</p>
      </div>
      <ReportsClient transactions={withBalance} totalIn={totalIn} totalOut={totalOut} balance={totalIn-totalOut} />
    </div>
  )
}
