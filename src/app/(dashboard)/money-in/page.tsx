import TransactionForm from '@/components/TransactionForm'

export default function MoneyInPage() {
  return (
    <div className="pt-14 md:pt-0">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
            <span className="text-lg">↑</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Record Investment</h1>
        </div>
        <p className="text-slate-500 text-sm">Log every investment received from the investor.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 max-w-2xl">
        <TransactionForm type="money_in" />
      </div>
    </div>
  )
}
