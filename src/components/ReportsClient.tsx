'use client'

import { useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { TransactionWithBalance } from '@/types'

interface Props {
  transactions: TransactionWithBalance[]
  totalIn: number
  totalOut: number
  balance: number
}

export default function ReportsClient({ transactions, totalIn, totalOut, balance }: Props) {
  const [exporting, setExporting] = useState<string | null>(null)

  function getRows() {
    return transactions.map(t => ({
      Date: t.date,
      Type: t.type === 'money_in' ? 'Money In' : 'Money Out',
      Amount: t.amount,
      'Payment Method / Category': t.payment_method || t.category || '',
      Description: t.description || '',
      'Reference / Project': t.reference_number || t.project_purpose || '',
      Notes: t.notes || '',
      'Running Balance': t.running_balance,
    }))
  }

  async function exportCSV() {
    setExporting('csv')
    const rows = getRows()
    if (!rows.length) { setExporting(null); return }

    const headers = Object.keys(rows[0])
    const csv = [
      headers.join(','),
      ...rows.map(r =>
        headers.map(h => {
          const val = r[h as keyof typeof r]
          return typeof val === 'string' && val.includes(',') ? `"${val}"` : val
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cabana-transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(null)
  }

  async function exportExcel() {
    setExporting('excel')
    const XLSX = await import('xlsx')
    const rows = getRows()

    // Add summary rows
    const summaryRows = [
      { Date: 'SUMMARY', Type: '', Amount: '', 'Payment Method / Category': '', Description: '', 'Reference / Project': '', Notes: '', 'Running Balance': '' },
      { Date: 'Total Investment Received', Type: '', Amount: totalIn, 'Payment Method / Category': '', Description: '', 'Reference / Project': '', Notes: '', 'Running Balance': '' },
      { Date: 'Total Money Spent', Type: '', Amount: totalOut, 'Payment Method / Category': '', Description: '', 'Reference / Project': '', Notes: '', 'Running Balance': '' },
      { Date: 'Current Balance', Type: '', Amount: balance, 'Payment Method / Category': '', Description: '', 'Reference / Project': '', Notes: '', 'Running Balance': '' },
      { Date: '', Type: '', Amount: '', 'Payment Method / Category': '', Description: '', 'Reference / Project': '', Notes: '', 'Running Balance': '' },
    ]

    const ws = XLSX.utils.json_to_sheet([...summaryRows, ...rows])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions')
    XLSX.writeFile(wb, `cabana-transactions-${new Date().toISOString().split('T')[0]}.xlsx`)
    setExporting(null)
  }

  async function exportPDF() {
    setExporting('pdf')
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF({ orientation: 'landscape' })

    // Header
    doc.setFontSize(18)
    doc.setTextColor(37, 99, 235)
    doc.text('Cabana Finance — Transaction Report', 14, 15)

    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)
    doc.text(`Generated: ${new Date().toLocaleDateString('en-KE')}`, 14, 22)

    // Summary
    doc.setFontSize(11)
    doc.setTextColor(30, 41, 59)
    doc.text(`Total In: ${formatCurrency(totalIn)}   |   Total Out: ${formatCurrency(totalOut)}   |   Balance: ${formatCurrency(balance)}`, 14, 30)

    // Table
    autoTable(doc, {
      startY: 36,
      head: [['Date', 'Type', 'Amount (KES)', 'Method/Category', 'Description', 'Balance (KES)']],
      body: transactions.map(t => [
        formatDate(t.date),
        t.type === 'money_in' ? 'In' : 'Out',
        t.amount.toLocaleString(),
        t.payment_method || t.category || '—',
        t.description || '—',
        t.running_balance.toLocaleString(),
      ]),
      headStyles: { fillColor: [37, 99, 235], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { cellPadding: 2 },
    })

    doc.save(`cabana-transactions-${new Date().toISOString().split('T')[0]}.pdf`)
    setExporting(null)
  }

  const exports = [
    {
      id: 'excel',
      label: 'Export to Excel',
      desc: 'Download .xlsx file with summary sheet',
      icon: '📊',
      color: 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100',
      textColor: 'text-emerald-700',
      action: exportExcel,
    },
    {
      id: 'csv',
      label: 'Export to CSV',
      desc: 'Google Sheets compatible .csv file',
      icon: '📋',
      color: 'bg-blue-50 border-blue-100 hover:bg-blue-100',
      textColor: 'text-blue-700',
      action: exportCSV,
    },
    {
      id: 'pdf',
      label: 'Export to PDF',
      desc: 'Formatted report with summary',
      icon: '📄',
      color: 'bg-red-50 border-red-100 hover:bg-red-100',
      textColor: 'text-red-600',
      action: exportPDF,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-emerald-50 rounded-xl">
            <div className="text-xs text-slate-500 mb-1">Total Investment</div>
            <div className="text-xl font-bold text-emerald-700">{formatCurrency(totalIn)}</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-xl">
            <div className="text-xs text-slate-500 mb-1">Total Spent</div>
            <div className="text-xl font-bold text-red-600">{formatCurrency(totalOut)}</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-xs text-slate-500 mb-1">Current Balance</div>
            <div className={`text-xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-orange-600'}`}>
              {formatCurrency(balance)}
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-400 text-center">
          {transactions.length} total transaction{transactions.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Export options */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-4">Export</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exports.map(exp => (
            <button
              key={exp.id}
              onClick={exp.action}
              disabled={!!exporting || transactions.length === 0}
              className={`flex flex-col items-center p-5 rounded-xl border-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${exp.color}`}
            >
              <div className="text-3xl mb-2">{exp.icon}</div>
              <div className={`font-semibold text-sm mb-1 ${exp.textColor}`}>
                {exporting === exp.id ? 'Generating...' : exp.label}
              </div>
              <div className="text-xs text-slate-400">{exp.desc}</div>
            </button>
          ))}
        </div>
        {transactions.length === 0 && (
          <p className="text-center text-sm text-slate-400 mt-4">No transactions to export yet.</p>
        )}
      </div>
    </div>
  )
}
