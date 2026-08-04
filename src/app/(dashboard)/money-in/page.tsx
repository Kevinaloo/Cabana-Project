import TransactionForm from '@/components/TransactionForm'

export default function MoneyInPage() {
  return (
    <div className="page-in" style={{ paddingBottom:48 }}>
      <div style={{ marginBottom:28 }}>
        <p className="section-label" style={{ marginBottom:6, color:'var(--green)' }}>Record</p>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:8 }}>
          <div style={{
            width:44, height:44, borderRadius:13, flexShrink:0,
            background:'rgba(14,207,142,0.12)', border:'1px solid rgba(14,207,142,0.25)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:22, color:'var(--green)',
          }}>↑</div>
          <h1 style={{ fontFamily:'Manrope,sans-serif', fontSize:28, fontWeight:900, color:'#f0f6ff', letterSpacing:'-0.6px' }}>
            Record Investment
          </h1>
        </div>
        <p style={{ color:'var(--t3)', fontSize:13.5 }}>Log every investment received. All amounts are tracked in KES with full evidence trail.</p>
      </div>
      <div className="glass" style={{ padding:'28px 28px', maxWidth:680 }}>
        <TransactionForm type="money_in" />
      </div>
    </div>
  )
}
