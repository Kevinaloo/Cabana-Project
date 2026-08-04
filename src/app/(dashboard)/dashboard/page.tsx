import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: txns } = await supabase
    .from('transactions').select('*')
    .order('date', { ascending: true })
    .order('created_at', { ascending: true })

  const all: Transaction[] = txns ?? []

  // Running balance per transaction
  let running = 0
  const withBal = all.map(t => {
    running += t.type === 'money_in' ? t.amount : -t.amount
    return { ...t, running_balance: running }
  })

  const totalIn  = all.filter(t => t.type === 'money_in').reduce((s,t) => s + t.amount, 0)
  const totalOut = all.filter(t => t.type === 'money_out').reduce((s,t) => s + t.amount, 0)
  const balance  = totalIn - totalOut
  const count    = all.length
  const recent   = [...withBal].reverse().slice(0, 10)

  // Category breakdown
  const catMap: Record<string,number> = {}
  all.filter(t => t.type === 'money_out').forEach(t => {
    const k = t.category || 'Other'
    catMap[k] = (catMap[k] || 0) + t.amount
  })
  const cats = Object.entries(catMap).sort((a,b) => b[1]-a[1])

  // Monthly trend (last 6 months)
  const monthlyMap: Record<string,{in:number,out:number}> = {}
  all.forEach(t => {
    const m = t.date.slice(0,7)
    if (!monthlyMap[m]) monthlyMap[m] = {in:0,out:0}
    if (t.type === 'money_in') monthlyMap[m].in += t.amount
    else monthlyMap[m].out += t.amount
  })
  const months = Object.entries(monthlyMap).sort().slice(-6)
  const maxMonth = Math.max(...months.flatMap(([,v]) => [v.in, v.out]), 1)

  // Payment method breakdown (money in)
  const methodMap: Record<string,number> = {}
  all.filter(t => t.type === 'money_in').forEach(t => {
    const k = t.payment_method || 'Other'
    methodMap[k] = (methodMap[k] || 0) + t.amount
  })
  const methods = Object.entries(methodMap).sort((a,b) => b[1]-a[1])

  const spentPct = totalIn > 0 ? Math.min((totalOut/totalIn)*100, 100) : 0
  const remPct   = totalIn > 0 ? Math.max((balance/totalIn)*100, 0) : 0

  // Ticker items
  const ticker = [
    `💰 Balance: ${formatCurrency(balance)}`,
    `📈 Total Invested: ${formatCurrency(totalIn)}`,
    `📉 Total Spent: ${formatCurrency(totalOut)}`,
    `🔄 Transactions: ${count}`,
    `📊 Utilization: ${spentPct.toFixed(1)}%`,
    ...cats.slice(0,3).map(([k,v]) => `• ${k}: ${formatCurrency(v)}`),
  ]

  function monthLabel(m: string) {
    return new Date(m + '-01').toLocaleDateString('en-KE', { month:'short', year:'2-digit' })
  }

  const CAT_COLORS = ['var(--red)','var(--gold)','var(--purple)','var(--blue)','var(--green)']
  const METHOD_COLORS = ['var(--green)','var(--blue)','var(--gold)','var(--purple)']

  return (
    <div className="page-in" style={{ paddingBottom:48, maxWidth:1240 }}>

      {/* ── LIVE TICKER ─────────────────────────────────── */}
      <div className="glass" style={{
        borderRadius:12, padding:'10px 0', marginBottom:24, overflow:'hidden',
        background:'rgba(14,207,142,0.04)', borderColor:'rgba(14,207,142,0.15)',
      }}>
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {[...ticker,...ticker].map((item,i) => (
              <span key={i} style={{ padding:'0 32px', fontSize:12, fontWeight:600, color:'var(--t2)', borderRight:'1px solid rgba(255,255,255,0.06)', whiteSpace:'nowrap', display:'inline-block' }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── PAGE HEADER ─────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:28, gap:16, flexWrap:'wrap' }}>
        <div>
          <p className="section-label" style={{ marginBottom:6, color:'var(--green)', letterSpacing:'1.5px' }}>Live Overview</p>
          <h1 style={{ fontFamily:'Manrope,sans-serif', fontSize:30, fontWeight:900, color:'#f0f6ff', letterSpacing:'-0.8px', lineHeight:1.05 }}>
            Investment Dashboard
          </h1>
          <p style={{ color:'var(--t3)', fontSize:13.5, marginTop:6 }}>
            Full transparency — every shilling tracked in real time
          </p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Link href="/money-in" className="btn btn-primary" style={{ textDecoration:'none', fontSize:13 }}>
            + Record Investment
          </Link>
          <Link href="/reports" className="btn btn-glass" style={{ textDecoration:'none', fontSize:13 }}>
            Export →
          </Link>
        </div>
      </div>

      {/* ── KPI CARDS ───────────────────────────────────── */}
      <div className="stagger" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14, marginBottom:16 }} id="kpi-grid">

        {/* Total In */}
        <div className="glass glass-green card-in" style={{ padding:'22px 20px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-30, right:-30, width:110, height:110, borderRadius:'50%', background:'radial-gradient(circle,rgba(14,207,142,0.14) 0%,transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'relative', zIndex:2 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div style={{ width:38, height:38, borderRadius:11, background:'rgba(14,207,142,0.15)', border:'1px solid rgba(14,207,142,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>📈</div>
              <span className="badge badge-green" style={{ fontSize:10 }}>LIVE</span>
            </div>
            <div className="stat-num" style={{ fontSize:28, color:'#4dffc0', marginBottom:4 }}>{formatCurrency(totalIn)}</div>
            <div style={{ fontSize:12, color:'var(--t3)', fontWeight:500 }}>Total Investment Received</div>
            <div style={{ fontSize:11, color:'var(--green)', marginTop:6, fontWeight:600 }}>
              {all.filter(t=>t.type==='money_in').length} deposit{all.filter(t=>t.type==='money_in').length!==1?'s':''}
            </div>
          </div>
        </div>

        {/* Total Out */}
        <div className="glass glass-red card-in" style={{ padding:'22px 20px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-30, right:-30, width:110, height:110, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,107,138,0.12) 0%,transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'relative', zIndex:2 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div style={{ width:38, height:38, borderRadius:11, background:'rgba(255,107,138,0.12)', border:'1px solid rgba(255,107,138,0.22)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>📉</div>
              <span className="badge badge-red" style={{ fontSize:10 }}>TRACKED</span>
            </div>
            <div className="stat-num" style={{ fontSize:28, color:'#ff9ab3', marginBottom:4 }}>{formatCurrency(totalOut)}</div>
            <div style={{ fontSize:12, color:'var(--t3)', fontWeight:500 }}>Total Expenditure</div>
            <div style={{ fontSize:11, color:'var(--red)', marginTop:6, fontWeight:600 }}>
              {all.filter(t=>t.type==='money_out').length} expense{all.filter(t=>t.type==='money_out').length!==1?'s':''}
            </div>
          </div>
        </div>

        {/* Balance */}
        <div className={`glass ${balance>=0?'glass-blue':'glass-gold'} card-in`} style={{ padding:'22px 20px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-30, right:-30, width:110, height:110, borderRadius:'50%', background:`radial-gradient(circle,${balance>=0?'rgba(110,180,255,0.12)':'rgba(255,203,107,0.12)'} 0%,transparent 70%)`, pointerEvents:'none' }} />
          <div style={{ position:'relative', zIndex:2 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div style={{ width:38, height:38, borderRadius:11, background:balance>=0?'rgba(110,180,255,0.12)':'rgba(255,203,107,0.12)', border:`1px solid ${balance>=0?'rgba(110,180,255,0.22)':'rgba(255,203,107,0.22)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>💰</div>
              <span className={`badge ${balance>=0?'badge-blue':'badge-gold'}`} style={{ fontSize:10 }}>{balance>=0?'HEALTHY':'WATCH'}</span>
            </div>
            <div className="stat-num" style={{ fontSize:28, color:balance>=0?'#9fd0ff':'#ffe08a', marginBottom:4 }}>{formatCurrency(balance)}</div>
            <div style={{ fontSize:12, color:'var(--t3)', fontWeight:500 }}>Current Balance</div>
            <div style={{ fontSize:11, color:balance>=0?'var(--blue)':'var(--gold)', marginTop:6, fontWeight:600 }}>
              {remPct.toFixed(1)}% of funds remaining
            </div>
          </div>
        </div>

        {/* Transaction count */}
        <div className="glass card-in" style={{ padding:'22px 20px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-30, right:-30, width:110, height:110, borderRadius:'50%', background:'radial-gradient(circle,rgba(179,157,255,0.1) 0%,transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'relative', zIndex:2 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div style={{ width:38, height:38, borderRadius:11, background:'rgba(179,157,255,0.1)', border:'1px solid rgba(179,157,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🔄</div>
              <span className="badge badge-purple" style={{ fontSize:10 }}>ALL TIME</span>
            </div>
            <div className="stat-num" style={{ fontSize:28, color:'var(--purple)', marginBottom:4 }}>{count}</div>
            <div style={{ fontSize:12, color:'var(--t3)', fontWeight:500 }}>Total Transactions</div>
            <div style={{ fontSize:11, color:'var(--purple)', marginTop:6, fontWeight:600 }}>
              {new Set(all.map(t=>t.date.slice(0,7))).size} active month{new Set(all.map(t=>t.date.slice(0,7))).size!==1?'s':''}
            </div>
          </div>
        </div>
      </div>

      {/* ── FUND UTILIZATION ────────────────────────────── */}
      {totalIn > 0 && (
        <div className="glass card-in" style={{ padding:'24px 24px', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <div>
              <p className="section-label" style={{ marginBottom:4 }}>Fund Utilization</p>
              <p style={{ fontSize:13, color:'var(--t3)' }}>Investment deployment status</p>
            </div>
            <div className="num" style={{ textAlign:'right' }}>
              <div style={{ fontSize:11, color:'var(--t3)', marginBottom:2 }}>Remaining</div>
              <div style={{ fontSize:20, fontWeight:800, color:balance>=0?'var(--green)':'var(--gold)' }}>{remPct.toFixed(1)}%</div>
            </div>
          </div>

          {/* Main utilization bar */}
          <div style={{ position:'relative', height:14, borderRadius:999, overflow:'hidden', marginBottom:20, background:'rgba(255,255,255,0.05)' }}>
            {/* Spent segment */}
            <div className="bar-animate" style={{
              position:'absolute', left:0, top:0, bottom:0,
              width:`${spentPct}%`,
              background:'linear-gradient(90deg, var(--red), rgba(255,107,138,0.7))',
              borderRadius:999,
            }} />
            {/* Remaining segment */}
            <div style={{
              position:'absolute', top:0, bottom:0,
              left:`${spentPct}%`,
              right:0,
              background:'linear-gradient(90deg,rgba(14,207,142,0.25),rgba(14,207,142,0.12))',
              borderRadius:'0 999px 999px 0',
            }} />
            {/* Divider line */}
            {spentPct > 0 && spentPct < 100 && (
              <div style={{ position:'absolute', left:`${spentPct}%`, top:0, bottom:0, width:2, background:'rgba(255,255,255,0.5)', transform:'translateX(-50%)' }} />
            )}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              { label:'Deployed', amount:totalOut, pct:spentPct, color:'var(--red)', dim:'rgba(255,107,138,0.12)' },
              { label:'Available', amount:balance, pct:remPct, color:'var(--green)', dim:'rgba(14,207,142,0.10)' },
            ].map(row => (
              <div key={row.label} style={{ background:row.dim, border:`1px solid ${row.color}25`, borderRadius:14, padding:'14px 16px' }}>
                <div style={{ fontSize:11, color:'var(--t3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:8 }}>{row.label}</div>
                <div className="num" style={{ fontSize:22, fontWeight:800, color:row.color, letterSpacing:'-0.5px' }}>{formatCurrency(row.amount)}</div>
                <div style={{ fontSize:12, color:row.color, marginTop:4, fontWeight:600, opacity:0.8 }}>{row.pct.toFixed(1)}% of total</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MONTHLY TREND CHART ─────────────────────────── */}
      {months.length > 0 && (
        <div className="glass card-in" style={{ padding:'24px 24px', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
            <div>
              <p className="section-label" style={{ marginBottom:4 }}>Monthly Trend</p>
              <p style={{ fontSize:13, color:'var(--t3)' }}>Investment vs Expenditure by month</p>
            </div>
            <div style={{ display:'flex', gap:16 }}>
              {[{c:'var(--green)',l:'In'},{c:'var(--red)',l:'Out'}].map(item=>(
                <div key={item.l} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--t3)' }}>
                  <div style={{ width:10, height:10, borderRadius:3, background:item.c }} />
                  Money {item.l}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:120 }}>
            {months.map(([m, vals]) => (
              <div key={m} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, minWidth:0 }}>
                <div style={{ width:'100%', display:'flex', gap:3, alignItems:'flex-end', height:96 }}>
                  <div style={{
                    flex:1, borderRadius:'4px 4px 0 0',
                    background:'linear-gradient(180deg,var(--green),rgba(14,207,142,0.5))',
                    height:`${(vals.in/maxMonth)*100}%`,
                    minHeight: vals.in > 0 ? 4 : 0,
                    boxShadow:'0 0 12px rgba(14,207,142,0.2)',
                    transition:'height 1s cubic-bezier(.16,1,.3,1)',
                  }} title={`In: ${formatCurrency(vals.in)}`} />
                  <div style={{
                    flex:1, borderRadius:'4px 4px 0 0',
                    background:'linear-gradient(180deg,var(--red),rgba(255,107,138,0.5))',
                    height:`${(vals.out/maxMonth)*100}%`,
                    minHeight: vals.out > 0 ? 4 : 0,
                    boxShadow:'0 0 12px rgba(255,107,138,0.2)',
                    transition:'height 1s cubic-bezier(.16,1,.3,1)',
                  }} title={`Out: ${formatCurrency(vals.out)}`} />
                </div>
                <span style={{ fontSize:10, color:'var(--t3)', fontWeight:600, letterSpacing:'0.3px' }}>{monthLabel(m)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── BOTTOM GRID: Activity + Breakdowns ──────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:14 }} id="bottom-grid">

        {/* Recent Activity */}
        <div className="glass card-in" style={{ overflow:'hidden' }}>
          <div style={{ padding:'18px 22px 14px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <p className="section-label" style={{ marginBottom:3 }}>Recent Activity</p>
              <p style={{ fontSize:13, color:'var(--t3)' }}>Latest {recent.length} transactions — click any to view full details</p>
            </div>
            <Link href="/transactions" style={{ fontSize:12, color:'var(--t3)', textDecoration:'none', fontWeight:600, padding:'5px 12px', borderRadius:9, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
              View all →
            </Link>
          </div>
          <div style={{ height:1, background:'rgba(255,255,255,0.05)' }} />

          {recent.length === 0 ? (
            <div style={{ textAlign:'center', padding:'48px 20px' }}>
              <div style={{ fontSize:40, marginBottom:10 }}>📋</div>
              <p style={{ fontSize:14, color:'var(--t3)' }}>No transactions yet.</p>
              <p style={{ fontSize:12, color:'var(--t4)', marginTop:4 }}>Add your first via Money In.</p>
            </div>
          ) : (
            <div className="stagger">
              {recent.map((t, i) => (
                <Link key={t.id} href={`/transactions/${t.id}`} style={{ textDecoration:'none', display:'block' }}>
                  <div style={{
                    display:'flex', alignItems:'center', gap:13, padding:'13px 22px',
                    borderBottom: i < recent.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                    cursor:'pointer', transition:'background 0.12s',
                  }} className="txn-row-hover">

                    {/* Type icon */}
                    <div style={{
                      width:38, height:38, borderRadius:11, flexShrink:0,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      background: t.type==='money_in' ? 'rgba(14,207,142,0.1)' : 'rgba(255,107,138,0.08)',
                      border: `1px solid ${t.type==='money_in' ? 'rgba(14,207,142,0.2)' : 'rgba(255,107,138,0.16)'}`,
                      color: t.type==='money_in' ? 'var(--green)' : 'var(--red)',
                      fontSize:17, fontWeight:700,
                    }}>
                      {t.type==='money_in' ? '↑' : '↓'}
                    </div>

                    {/* Info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
                        <span style={{ fontSize:13.5, fontWeight:600, color:'var(--t1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {t.description || t.payment_method || t.category || '—'}
                        </span>
                        {t.proof_url && <span className="badge badge-blue" style={{ fontSize:9, padding:'2px 7px' }}>📎 PROOF</span>}
                      </div>
                      <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                        <span style={{ fontSize:11, color:'var(--t3)' }}>{formatDate(t.date)}</span>
                        {(t.payment_method||t.category) && (
                          <span style={{ fontSize:11, color:'var(--t4)', background:'rgba(255,255,255,0.04)', padding:'1px 8px', borderRadius:5, fontWeight:500 }}>
                            {t.payment_method||t.category}
                          </span>
                        )}
                        {t.reference_number && <span style={{ fontSize:11, color:'var(--t4)', fontFamily:'monospace' }}>{t.reference_number}</span>}
                        {t.project_purpose && <span style={{ fontSize:11, color:'var(--t4)' }}>{t.project_purpose}</span>}
                      </div>
                    </div>

                    {/* Amount + running balance */}
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div className="num" style={{ fontSize:15, fontWeight:800, color:t.type==='money_in'?'#4dffc0':'#ff9ab3', letterSpacing:'-0.3px' }}>
                        {t.type==='money_in'?'+':'-'}{formatCurrency(t.amount)}
                      </div>
                      <div className="num" style={{ fontSize:10, color:'var(--t4)', marginTop:3 }}>
                        Bal: <span style={{ color:t.running_balance>=0?'var(--blue)':'var(--gold)' }}>{formatCurrency(t.running_balance)}</span>
                      </div>
                    </div>

                    <div style={{ color:'var(--t4)', fontSize:14, flexShrink:0 }}>›</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Breakdowns */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Spending by category */}
          {cats.length > 0 && (
            <div className="glass card-in" style={{ padding:'20px 22px' }}>
              <p className="section-label" style={{ marginBottom:4 }}>Spending by Category</p>
              <p style={{ fontSize:13, color:'var(--t3)', marginBottom:18 }}>Where the money is going</p>
              <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
                {cats.map(([cat, amt], i) => {
                  const pct = totalOut > 0 ? (amt/totalOut)*100 : 0
                  const color = CAT_COLORS[i % CAT_COLORS.length]
                  return (
                    <div key={cat}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                          <div style={{ width:8, height:8, borderRadius:'50%', background:color, boxShadow:`0 0 8px ${color}88`, flexShrink:0 }} />
                          <span style={{ fontSize:13, color:'var(--t2)', fontWeight:500 }}>{cat}</span>
                        </div>
                        <div style={{ display:'flex', gap:10, alignItems:'baseline' }}>
                          <span className="num" style={{ fontSize:13, color:'var(--t2)', fontWeight:700 }}>{formatCurrency(amt)}</span>
                          <span style={{ fontSize:11, color:'var(--t3)', minWidth:32, textAlign:'right' }}>{pct.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="track" style={{ height:5 }}>
                        <div className="fill bar-animate" style={{ width:`${pct}%`, background:`linear-gradient(90deg,${color},${color}99)`, boxShadow:`0 0 8px ${color}55` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Investment sources */}
          {methods.length > 0 && (
            <div className="glass card-in" style={{ padding:'20px 22px' }}>
              <p className="section-label" style={{ marginBottom:4 }}>Investment Sources</p>
              <p style={{ fontSize:13, color:'var(--t3)', marginBottom:18 }}>How money was deposited</p>
              <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
                {methods.map(([method, amt], i) => {
                  const pct = totalIn > 0 ? (amt/totalIn)*100 : 0
                  const color = METHOD_COLORS[i % METHOD_COLORS.length]
                  return (
                    <div key={method}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                          <div style={{ width:8, height:8, borderRadius:'50%', background:color, boxShadow:`0 0 8px ${color}88`, flexShrink:0 }} />
                          <span style={{ fontSize:13, color:'var(--t2)', fontWeight:500 }}>{method}</span>
                        </div>
                        <div style={{ display:'flex', gap:10, alignItems:'baseline' }}>
                          <span className="num" style={{ fontSize:13, color:'var(--t2)', fontWeight:700 }}>{formatCurrency(amt)}</span>
                          <span style={{ fontSize:11, color:'var(--t3)', minWidth:32, textAlign:'right' }}>{pct.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="track" style={{ height:5 }}>
                        <div className="fill bar-animate-delay" style={{ width:`${pct}%`, background:`linear-gradient(90deg,${color},${color}99)`, boxShadow:`0 0 8px ${color}55` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="glass card-in" style={{ padding:'20px 22px' }}>
            <p className="section-label" style={{ marginBottom:16 }}>Quick Actions</p>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { href:'/money-in',     label:'Record Investment',   icon:'↑', color:'var(--green)',  dim:'rgba(14,207,142,0.1)',  border:'rgba(14,207,142,0.2)' },
                { href:'/money-out',    label:'Record Expense',      icon:'↓', color:'var(--red)',    dim:'rgba(255,107,138,0.08)', border:'rgba(255,107,138,0.18)' },
                { href:'/transactions', label:'View All Transactions',icon:'≡', color:'var(--blue)',  dim:'rgba(110,180,255,0.08)', border:'rgba(110,180,255,0.18)' },
                { href:'/reports',      label:'Download Report',     icon:'⬇', color:'var(--purple)', dim:'rgba(179,157,255,0.08)', border:'rgba(179,157,255,0.18)' },
              ].map(item => (
                <Link key={item.href} href={item.href} style={{
                  display:'flex', alignItems:'center', gap:12,
                  padding:'12px 14px', borderRadius:12, textDecoration:'none',
                  background:item.dim, border:`1px solid ${item.border}`,
                  transition:'all 0.15s',
                }} className="quick-action">
                  <div style={{ width:32, height:32, borderRadius:9, background:`${item.color}22`, border:`1px solid ${item.color}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:item.color, fontWeight:700, flexShrink:0 }}>
                    {item.icon}
                  </div>
                  <span style={{ fontSize:13.5, fontWeight:600, color:'var(--t2)' }}>{item.label}</span>
                  <span style={{ marginLeft:'auto', color:'var(--t4)', fontSize:14 }}>›</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        #kpi-grid { grid-template-columns: repeat(2,1fr); }
        @media (min-width:900px) {
          #kpi-grid { grid-template-columns: repeat(4,1fr); }
          #bottom-grid { grid-template-columns: 1fr 320px; }
        }
        .txn-row-hover:hover { background: rgba(255,255,255,0.025) !important; }
        .quick-action:hover { filter: brightness(1.12); transform: translateX(2px); }
      `}</style>
    </div>
  )
}
