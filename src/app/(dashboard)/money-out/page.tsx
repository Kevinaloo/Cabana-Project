import TransactionForm from '@/components/TransactionForm'

export default function MoneyOutPage() {
  return (
    <div className="page-in" style={{ paddingBottom:48 }}>
      <div style={{ marginBottom:28 }}>
        <p className="section-label" style={{ marginBottom:6, color:'var(--red)' }}>Record</p>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:8 }}>
          <div style={{
            width:44, height:44, borderRadius:13, flexShrink:0,
            background:'rgba(255,107,138,0.1)', border:'1px solid rgba(255,107,138,0.22)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:22, color:'var(--red)',
          }}>↓</div>
          <h1 style={{ fontFamily:'Manrope,sans-serif', fontSize:28, fontWeight:900, color:'#f0f6ff', letterSpacing:'-0.6px' }}>
            Record Expense
          </h1>
        </div>
        <p style={{ color:'var(--t3)', fontSize:13.5 }}>Log every expense paid from the fund. All spending is categorised and receipts attached.</p>
      </div>
      <div className="glass" style={{ padding:'28px 28px', maxWidth:680 }}>
        <TransactionForm type="money_out" />
      </div>
    </div>
  )
}
