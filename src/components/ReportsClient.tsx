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
      ...rows.map(r => headers.map(h => {
        const val = r[h as keyof typeof r]
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      }).join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `cabana-transactions-${new Date().toISOString().split('T')[0]}.csv`; a.click()
    URL.revokeObjectURL(url)
    setExporting(null)
  }

  async function exportExcel() {
    setExporting('excel')
    const XLSX = await import('xlsx')
    const rows = getRows()
    const summaryRows = [
      { Date: 'SUMMARY', Type: '', Amount: '', 'Payment Method / Category': '', Description: '', 'Reference / Project': '', Notes: '', 'Running Balance': '' },
      { Date: 'Total Investment', Type: '', Amount: totalIn, 'Payment Method / Category': '', Description: '', 'Reference / Project': '', Notes: '', 'Running Balance': '' },
      { Date: 'Total Spent', Type: '', Amount: totalOut, 'Payment Method / Category': '', Description: '', 'Reference / Project': '', Notes: '', 'Running Balance': '' },
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
    doc.setFontSize(18); doc.setTextColor(16, 185, 129)
    doc.text('Cabana Finance — Transaction Report', 14, 15)
    doc.setFontSize(10); doc.setTextColor(100, 116, 139)
    doc.text(`Generated: ${new Date().toLocaleDateString('en-KE')}`, 14, 22)
    doc.setFontSize(11); doc.setTextColor(30, 41, 59)
    doc.text(`Total In: ${formatCurrency(totalIn)}   |   Total Out: ${formatCurrency(totalOut)}   |   Balance: ${formatCurrency(balance)}`, 14, 30)
    autoTable(doc, {
      startY: 36,
      head: [['Date', 'Type', 'Amount (KES)', 'Method/Category', 'Description', 'Balance (KES)']],
      body: transactions.map(t => [
        formatDate(t.date), t.type === 'money_in' ? 'In' : 'Out',
        t.amount.toLocaleString(), t.payment_method || t.category || '—',
        t.description || '—', t.running_balance.toLocaleString(),
      ]),
      headStyles: { fillColor: [16, 185, 129], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [15, 23, 42] },
      styles: { cellPadding: 2 },
    })
    doc.save(`cabana-transactions-${new Date().toISOString().split('T')[0]}.pdf`)
    setExporting(null)
  }

  const card = (bg: string, border: string): React.CSSProperties => ({
    background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: '16px',
    textAlign: 'center',
  })

  const exportBtns = [
    { id: 'excel', label: 'Export to Excel', desc: '.xlsx with summary sheet', icon: '📊', accent: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', action: exportExcel },
    { id: 'csv', label: 'Export to CSV', desc: 'Google Sheets compatible', icon: '📋', accent: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)', action: exportCSV },
    { id: 'pdf', label: 'Export to PDF', desc: 'Formatted report', icon: '📄', accent: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)', action: exportPDF },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Summary cards */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px' }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: '#64748b', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} className="summary-grid">
          <div style={card('rgba(16,185,129,0.08)', 'rgba(16,185,129,0.2)')}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Total Investment</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981', letterSpacing: '-0.5px' }}>{formatCurrency(totalIn)}</div>
          </div>
          <div style={card('rgba(239,68,68,0.08)', 'rgba(239,68,68,0.2)')}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Total Spent</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#f87171', letterSpacing: '-0.5px' }}>{formatCurrency(totalOut)}</div>
          </div>
          <div style={card(balance >= 0 ? 'rgba(96,165,250,0.08)' : 'rgba(245,158,11,0.08)', balance >= 0 ? 'rgba(96,165,250,0.2)' : 'rgba(245,158,11,0.2)')}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Current Balance</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: balance >= 0 ? '#60a5fa' : '#fbbf24', letterSpacing: '-0.5px' }}>{formatCurrency(balance)}</div>
          </div>
        </div>
        <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: '#334155' }}>
          {transactions.length} total transaction{transactions.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Export */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px' }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: '#64748b', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Export Data</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} className="export-grid">
          {exportBtns.map(btn => (
            <button key={btn.id} onClick={btn.action}
              disabled={!!exporting || transactions.length === 0}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '20px 12px', borderRadius: 14,
                background: btn.bg, border: `1px solid ${btn.border}`,
                cursor: exporting || transactions.length === 0 ? 'not-allowed' : 'pointer',
                opacity: exporting && exporting !== btn.id ? 0.5 : 1,
                transition: 'all 0.2s',
              }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{btn.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: btn.accent, marginBottom: 4 }}>
                {exporting === btn.id ? 'Generating…' : btn.label}
              </div>
              <div style={{ fontSize: 11, color: '#475569' }}>{btn.desc}</div>
            </button>
          ))}
        </div>
        {transactions.length === 0 && (
          <p style={{ textAlign: 'center', fontSize: 13, color: '#334155', marginTop: 16 }}>
            No transactions to export yet.
          </p>
        )}
      </div>

      <style>{`
        @media (max-width: 540px) {
          .summary-grid { grid-template-columns: 1fr !important; }
          .export-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
