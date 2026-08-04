'use client'

import { useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { TransactionWithBalance } from '@/types'

interface Props {
  transactions: TransactionWithBalance[]
  totalIn: number; totalOut: number; balance: number
}

export default function ReportsClient({ transactions, totalIn, totalOut, balance }: Props) {
  const [exporting, setExporting] = useState<string|null>(null)

  function getRows() {
    return transactions.map(t => ({
      Date: t.date, Type: t.type==='money_in'?'Money In':'Money Out',
      'Amount (KES)': t.amount,
      'Payment Method / Category': t.payment_method||t.category||'',
      Description: t.description||'',
      'Reference / Project': t.reference_number||t.project_purpose||'',
      Notes: t.notes||'',
      'Running Balance (KES)': t.running_balance,
    }))
  }

  async function exportCSV() {
    setExporting('csv')
    const rows = getRows()
    if (!rows.length) { setExporting(null); return }
    const headers = Object.keys(rows[0])
    const csv = [headers.join(','), ...rows.map(r =>
      headers.map(h => { const v = r[h as keyof typeof r]; return typeof v==='string'&&v.includes(',') ? `"${v}"` : v }).join(',')
    )].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}))
    a.download = `cabana-transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    setExporting(null)
  }

  async function exportExcel() {
    setExporting('excel')
    const XLSX = await import('xlsx')
    const summary = [
      {Date:'SUMMARY',Type:'',['Amount (KES)']:'','Payment Method / Category':'',Description:'','Reference / Project':'',Notes:'','Running Balance (KES)':''},
      {Date:'Total Investment Received',Type:'',['Amount (KES)']:totalIn,'Payment Method / Category':'',Description:'','Reference / Project':'',Notes:'','Running Balance (KES)':''},
      {Date:'Total Money Spent',Type:'',['Amount (KES)']:totalOut,'Payment Method / Category':'',Description:'','Reference / Project':'',Notes:'','Running Balance (KES)':''},
      {Date:'Current Balance',Type:'',['Amount (KES)']:balance,'Payment Method / Category':'',Description:'','Reference / Project':'',Notes:'','Running Balance (KES)':''},
      {Date:'',Type:'',['Amount (KES)']:'','Payment Method / Category':'',Description:'','Reference / Project':'',Notes:'','Running Balance (KES)':''},
    ]
    const ws = XLSX.utils.json_to_sheet([...summary, ...getRows()])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions')
    XLSX.writeFile(wb, `cabana-transactions-${new Date().toISOString().split('T')[0]}.xlsx`)
    setExporting(null)
  }

  async function exportPDF() {
    setExporting('pdf')
    const { default: jsPDF }    = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF({ orientation:'landscape' })
    doc.setFontSize(20); doc.setTextColor(14,207,142)
    doc.text('Cabana Finance — Transaction Report', 14, 16)
    doc.setFontSize(10); doc.setTextColor(100,116,139)
    doc.text(`Generated: ${new Date().toLocaleDateString('en-KE')}`, 14, 23)
    doc.setFontSize(11); doc.setTextColor(240,246,255)
    doc.text(`Total In: ${formatCurrency(totalIn)}   |   Total Out: ${formatCurrency(totalOut)}   |   Balance: ${formatCurrency(balance)}`, 14, 31)
    autoTable(doc, {
      startY:37,
      head:[['Date','Type','Amount (KES)','Method/Category','Description','Balance (KES)']],
      body: transactions.map(t=>[formatDate(t.date),t.type==='money_in'?'In':'Out',t.amount.toLocaleString(),t.payment_method||t.category||'—',t.description||'—',t.running_balance.toLocaleString()]),
      headStyles:{ fillColor:[14,207,142], textColor:[2,26,16], fontSize:9, fontStyle:'bold' },
      bodyStyles:{ fontSize:8, textColor:[220,230,240] },
      alternateRowStyles:{ fillColor:[12,20,42] },
      tableLineColor:[40,60,90], tableLineWidth:0.1,
      styles:{ cellPadding:2.5 },
    })
    doc.save(`cabana-transactions-${new Date().toISOString().split('T')[0]}.pdf`)
    setExporting(null)
  }

  const exports = [
    { id:'excel', label:'Export to Excel', desc:'.xlsx with summary sheet', icon:'📊', color:'var(--green)', dim:'rgba(14,207,142,0.08)', border:'rgba(14,207,142,0.2)', action:exportExcel },
    { id:'csv',   label:'Export to CSV',   desc:'Google Sheets compatible', icon:'📋', color:'var(--blue)',  dim:'rgba(110,180,255,0.08)', border:'rgba(110,180,255,0.2)', action:exportCSV   },
    { id:'pdf',   label:'Export to PDF',   desc:'Formatted investor report',icon:'📄', color:'var(--red)',   dim:'rgba(255,107,138,0.07)', border:'rgba(255,107,138,0.18)', action:exportPDF   },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Summary */}
      <div className="glass" style={{ padding:'24px 24px' }}>
        <p className="section-label" style={{ marginBottom:18 }}>Financial Summary</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }} id="summary-grid">
          {[
            { label:'Total Investment', value:totalIn,  color:'var(--green)', dim:'rgba(14,207,142,0.08)',  border:'rgba(14,207,142,0.18)' },
            { label:'Total Spent',      value:totalOut, color:'var(--red)',   dim:'rgba(255,107,138,0.07)', border:'rgba(255,107,138,0.16)' },
            { label:'Current Balance',  value:balance,  color:balance>=0?'var(--blue)':'var(--gold)',
              dim:balance>=0?'rgba(110,180,255,0.07)':'rgba(255,203,107,0.07)',
              border:balance>=0?'rgba(110,180,255,0.18)':'rgba(255,203,107,0.18)' },
          ].map(s => (
            <div key={s.label} style={{ textAlign:'center', padding:'18px 14px', borderRadius:14, background:s.dim, border:`1px solid ${s.border}` }}>
              <div style={{ fontSize:11, color:'var(--t3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:10 }}>{s.label}</div>
              <div className="num" style={{ fontSize:22, fontWeight:900, color:s.color, letterSpacing:'-0.5px' }}>{formatCurrency(s.value)}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:'center', marginTop:14, fontSize:12, color:'var(--t4)' }}>
          {transactions.length} total transaction{transactions.length!==1?'s':''}
        </div>
      </div>

      {/* Export options */}
      <div className="glass" style={{ padding:'24px 24px' }}>
        <p className="section-label" style={{ marginBottom:6 }}>Export Data</p>
        <p style={{ fontSize:13, color:'var(--t3)', marginBottom:20 }}>Download a full record of all transactions for investor review</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }} id="export-grid">
          {exports.map(exp => (
            <button key={exp.id} onClick={exp.action}
              disabled={!!exporting||transactions.length===0}
              style={{
                display:'flex', flexDirection:'column', alignItems:'center', padding:'24px 16px',
                borderRadius:16, border:`2px solid ${exporting===exp.id?exp.color:exp.border}`,
                background: exporting===exp.id?exp.dim:'rgba(255,255,255,0.02)',
                cursor:'pointer', transition:'all 0.18s',
                opacity:!!exporting&&exporting!==exp.id?0.4:1,
              }}
              className="export-btn"
            >
              <div style={{ fontSize:34, marginBottom:10 }}>{exp.icon}</div>
              <div style={{ fontSize:14, fontWeight:700, color:exp.color, marginBottom:4 }}>
                {exporting===exp.id?'Generating…':exp.label}
              </div>
              <div style={{ fontSize:11, color:'var(--t3)' }}>{exp.desc}</div>
            </button>
          ))}
        </div>
        {transactions.length===0 && (
          <p style={{ textAlign:'center', fontSize:13, color:'var(--t4)', marginTop:16 }}>No transactions to export yet.</p>
        )}
      </div>

      <style>{`
        @media (max-width:600px) {
          #summary-grid { grid-template-columns:1fr !important; }
          #export-grid  { grid-template-columns:1fr !important; }
        }
        .export-btn:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.12); }
      `}</style>
    </div>
  )
}
