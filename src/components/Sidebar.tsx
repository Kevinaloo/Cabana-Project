'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const nav = [
  { href:'/dashboard',    label:'Dashboard',        icon:'M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-3a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z' },
  { href:'/money-in',     label:'Money In',         icon:'M12 4v16m0-16l-4 4m4-4l4 4M3 17h18' },
  { href:'/money-out',    label:'Money Out',         icon:'M12 20V4m0 16l-4-4m4 4l4-4M3 7h18' },
  { href:'/transactions', label:'Transactions',      icon:'M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01' },
  { href:'/reports',      label:'Reports & Export',  icon:'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
]

function Icon({ d }: { d: string }) {
  return (
    <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{flexShrink:0}}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
    </svg>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login'); router.refresh()
  }

  const Content = () => (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>

      {/* Brand */}
      <div style={{ padding:'22px 18px 18px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:11 }}>
          {/* Glass logo */}
          <div className="glass glass-green" style={{
            width:40, height:40, borderRadius:13, flexShrink:0,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 0 1px rgba(14,207,142,0.3) inset, 0 6px 20px rgba(14,207,142,0.3)',
            background:'linear-gradient(135deg,rgba(14,207,142,0.25) 0%,rgba(7,168,113,0.15) 100%)',
          }}>
            <svg width="20" height="20" fill="none" stroke="#0ecf8e" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:14.5, color:'#f0f6ff', letterSpacing:'-0.3px' }}>Cabana Finance</div>
            <div style={{ fontSize:10, color:'var(--green)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.9px', marginTop:1 }}>Investment Tracker</div>
          </div>
        </div>
      </div>

      <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)', margin:'0 16px' }} />

      {/* Nav */}
      <nav style={{ flex:1, padding:'14px 10px', display:'flex', flexDirection:'column', gap:3 }}>
        <div style={{ fontSize:9, fontWeight:700, color:'var(--t4)', textTransform:'uppercase', letterSpacing:'1.2px', padding:'4px 12px 8px' }}>Navigation</div>
        {nav.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} onClick={()=>setOpen(false)}
              className={`nav-item ${active ? 'active' : ''}`}
            >
              <Icon d={item.icon} />
              {item.label}
              {active && <span style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:'var(--green)', boxShadow:'0 0 10px var(--green)', flexShrink:0 }} />}
            </Link>
          )
        })}
      </nav>

      <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)', margin:'0 16px' }} />

      {/* User */}
      <div style={{ padding:'14px 10px' }}>
        <div className="glass" style={{
          display:'flex', alignItems:'center', gap:10,
          padding:'10px 12px', borderRadius:14, marginBottom:6,
        }}>
          <div style={{
            width:32, height:32, borderRadius:'50%', flexShrink:0,
            background:'linear-gradient(135deg,#0ecf8e,#07a871)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:13, fontWeight:800, color:'#021a10', fontFamily:'Manrope,sans-serif',
          }}>C</div>
          <div style={{minWidth:0}}>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--t1)', letterSpacing:'-0.1px' }}>Cabana Admin</div>
            <div style={{ fontSize:11, color:'var(--green)', fontWeight:500 }}>Founder</div>
          </div>
        </div>
        <button onClick={signOut} className="nav-item" style={{
          width:'100%', background:'none', border:'1px solid transparent', cursor:'pointer',
          color:'var(--t3)', fontFamily:'Inter,sans-serif',
        }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile bar */}
      <div className="hide-desktop" style={{
        position:'fixed', top:0, left:0, right:0, zIndex:40,
        background:'rgba(4,7,15,0.85)', backdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(255,255,255,0.07)',
        padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:30, height:30, borderRadius:9, background:'linear-gradient(135deg,rgba(14,207,142,0.2),rgba(7,168,113,0.12))', border:'1px solid rgba(14,207,142,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="15" height="15" fill="none" stroke="#0ecf8e" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <span style={{ fontFamily:'Manrope,sans-serif', fontWeight:800, color:'#f0f6ff', fontSize:14 }}>Cabana Finance</span>
        </div>
        <button onClick={()=>setOpen(!open)} style={{ padding:'7px 8px', borderRadius:9, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.09)', cursor:'pointer', color:'var(--t2)', lineHeight:0 }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>}
          </svg>
        </button>
      </div>

      {open && <div onClick={()=>setOpen(false)} style={{ position:'fixed', inset:0, zIndex:38, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)' }} />}

      {/* Mobile drawer */}
      <div className="hide-desktop" style={{
        position:'fixed', top:0, left:0, zIndex:39, width:260, height:'100%',
        background:'rgba(4,7,15,0.96)', backdropFilter:'blur(30px)',
        borderRight:'1px solid rgba(255,255,255,0.07)',
        transform:open ? 'translateX(0)' : 'translateX(-100%)',
        transition:'transform 0.24s cubic-bezier(.16,1,.3,1)',
        paddingTop:56,
      }}>
        <Content />
      </div>

      {/* Desktop */}
      <aside className="hide-mobile" style={{
        width:238, flexShrink:0, display:'flex', flexDirection:'column',
        background:'rgba(4,7,15,0.75)', backdropFilter:'blur(30px)',
        borderRight:'1px solid rgba(255,255,255,0.06)',
        position:'relative',
      }}>
        {/* Top accent line */}
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:'60%', height:1, background:'linear-gradient(90deg,transparent,rgba(14,207,142,0.5),transparent)' }} />
        <Content />
      </aside>
    </>
  )
}
