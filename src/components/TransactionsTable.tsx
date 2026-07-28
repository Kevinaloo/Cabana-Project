'use client'

import { useState, useMemo } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { TransactionWithBalance } from '@/types'
import ProofLink from './ProofLink'

interface Props {
  transactions: TransactionWithBalance[]
}

export default function TransactionsTable({ transactions }: Props) {
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'money_in' | 'money_out'>('all')

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false
      if (dateFrom && t.date < dateFrom) return false
      if (dateTo && t.date > dateTo) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          (t.description || '').toLowerCase().includes(q) ||
          (t.category || '').toLowerCase().includes(q) ||
          (t.payment_method || '').toLowerCase().includes(q) ||
          (t.reference_number || '').toLowerCase().includes(q) ||
          (t.project_purpose || '').toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [transactions, search, dateFrom, dateTo, typeFilter])

  return (
    <div className="bg-white rounded-2xl border border-slate-200">
      {/* Filters */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900"
        />
        <div className="flex gap-2 flex-wrap">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as 'all' | 'money_in' | 'money_out')}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
          >
            <option value="all">All Types</option>
            <option value="money_in">Money In</option>
            <option value="money_out">Money Out</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
            title="From date"
          />
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
            title="To date"
          />
          {(search || dateFrom || dateTo || typeFilter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setTypeFilter('all') }}
              className="px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 border border-slate-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="text-xs text-slate-400 px-4 py-2 border-b border-slate-50">
        {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-sm">No transactions found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Description</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Proof</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(t.date)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      t.type === 'money_in'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {t.type === 'money_in' ? '↑ In' : '↓ Out'}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-semibold whitespace-nowrap ${
                    t.type === 'money_in' ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {t.type === 'money_in' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell max-w-xs truncate">
                    {t.description || t.category || t.payment_method || '—'}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {t.proof_url ? (
                      <ProofLink path={t.proof_url} filename={t.proof_filename || 'proof'} />
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 font-semibold text-right whitespace-nowrap ${
                    t.running_balance >= 0 ? 'text-slate-800' : 'text-orange-600'
                  }`}>
                    {formatCurrency(t.running_balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
