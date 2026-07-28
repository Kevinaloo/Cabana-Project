import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import TransactionDetail from '@/components/TransactionDetail'

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data: transaction, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !transaction) notFound()

  // Get running balance up to this transaction
  const { data: allTxns } = await supabase
    .from('transactions')
    .select('id, type, amount, date, created_at')
    .order('date', { ascending: true })
    .order('created_at', { ascending: true })

  let runningBalance = 0
  let balanceBefore = 0
  for (const t of allTxns ?? []) {
    if (t.id === id) {
      balanceBefore = runningBalance
    }
    runningBalance += t.type === 'money_in' ? t.amount : -t.amount
    if (t.id === id) break
  }

  return (
    <TransactionDetail
      transaction={transaction}
      balanceBefore={balanceBefore}
      balanceAfter={balanceBefore + (transaction.type === 'money_in' ? transaction.amount : -transaction.amount)}
    />
  )
}
