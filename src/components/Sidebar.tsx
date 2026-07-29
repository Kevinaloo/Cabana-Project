'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const nav = [
  {
    href: '/dashboard', label: 'Dashboard',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-3a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" /></svg>,
  },
  {
    href: '/money-in', label: 'Money In',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m0-16l-4 4m4-4l4 4" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 17h18" /></svg>,
  },
  {
    href: '/money-out', label: 'Money Out',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 20V4m0 16l-4-4m4 4l4-4" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7h18" /></svg>,
  },
  {
    href: '/transactions', label: 'Transactions',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01" /></svg>,
  },
  {
    href: '/reports', label: 'Reports & Export',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const Content = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Brand */}
      <div style={{ padding: '22px 20px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(16,185,129,0.35)',
          }}>
            <svg width="19" height="19" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 800, fontSize: 15, color: '#f8fafc', letterSpacing: '-0.3px' }}>
              Cabana Finance
            </div>
            <div style={{ fontSize: 10, color: '#10b981', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: 1 }}>
              Investment Tracker
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 16px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '1px', padding: '2px 12px', marginBottom: 4 }}>Menu</div>
        {nav.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 11, fontSize: 13.5,
              fontWeight: active ? 600 : 400, textDecoration: 'none',
              background: active
                ? 'linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(5,150,105,0.10) 100%)'
                : 'transparent',
              color: active ? '#34d399' : '#64748b',
              border: active ? '1px solid rgba(16,185,129,0.22)' : '1px solid transparent',
              transition: 'all 0.15s',
              position: 'relative',
            }}
            className="nav-link"
            >
              <span style={{ opacity: active ? 1 : 0.7 }}>{item.icon}</span>
              {item.label}
              {active && (
                <span style={{
                  marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%',
                  background: '#10b981', boxShadow: '0 0 8px #10b981',
                }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 16px' }} />

      {/* User + sign out */}
      <div style={{ padding: '14px 10px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 11, marginBottom: 4,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'white', fontFamily: 'Manrope,sans-serif',
          }}>C</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', letterSpacing: '-0.1px' }}>Cabana Admin</div>
            <div style={{ fontSize: 11, color: '#10b981', fontWeight: 500 }}>Founder</div>
          </div>
        </div>
        <button onClick={signOut} className="nav-link" style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px', borderRadius: 11, fontSize: 13, fontWeight: 400,
          color: '#475569', background: 'none', border: '1px solid transparent', cursor: 'pointer',
          transition: 'all 0.15s', textAlign: 'left',
        }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile topbar */}
      <div className="hide-desktop" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
        background: 'rgba(8,13,26,0.92)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(16px)', padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(16,185,129,0.3)' }}>
            <svg width="15" height="15" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <span style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 800, color: '#f8fafc', fontSize: 14 }}>Cabana Finance</span>
        </div>
        <button onClick={() => setOpen(!open)} style={{ padding: '7px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: '#94a3b8', lineHeight: 0 }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile overlay */}
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 30, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(3px)' }} />}

      {/* Mobile drawer */}
      <div className="hide-desktop" style={{
        position: 'fixed', top: 0, left: 0, zIndex: 35, width: 260, height: '100%',
        background: '#080d1a', borderRight: '1px solid rgba(255,255,255,0.06)',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.22s cubic-bezier(.22,.68,0,1.2)',
        paddingTop: 54,
      }}>
        <Content />
      </div>

      {/* Desktop sidebar */}
      <aside className="hide-mobile" style={{
        width: 238, background: '#080d1a', borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'relative', zIndex: 10,
      }}>
        {/* Subtle top glow */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 120, height: 1, background: 'linear-gradient(90deg, transparent, #10b981, transparent)' }} />
        <Content />
      </aside>

      <style>{`
        .nav-link:hover { background: rgba(255,255,255,0.04) !important; color: #94a3b8 !important; border-color: rgba(255,255,255,0.05) !important; }
        .hide-mobile { display: flex !important; }
        .hide-desktop { display: none !important; }
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .hide-desktop { display: flex !important; }
        }
      `}</style>
    </>
  )
}
