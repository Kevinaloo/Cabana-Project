import TransactionForm from '@/components/TransactionForm'

export default function MoneyInPage() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11, flexShrink: 0,
            background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, color: '#10b981',
          }}>↑</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0, letterSpacing: '-0.4px' }}>
            Record Investment
          </h1>
        </div>
        <p style={{ fontSize: 14, color: '#475569', margin: 0 }}>
          Log every investment received from the investor.
        </p>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20, padding: '28px 24px', maxWidth: 680,
      }}>
        <TransactionForm type="money_in" />
      </div>
    </div>
  )
}
