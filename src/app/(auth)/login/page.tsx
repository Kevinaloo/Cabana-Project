'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPw, setShowPw]     = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/auth/login', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ username, password }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Invalid credentials')
      router.push('/dashboard'); router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight:'100vh',
      background:'radial-gradient(ellipse 80% 60% at 20% 40%, rgba(14,207,142,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 70%, rgba(110,180,255,0.05) 0%, transparent 55%), #04070f',
      display:'flex', alignItems:'center', justifyContent:'center', padding:20,
    }}>

      {/* Grid background */}
      <div style={{
        position:'fixed', inset:0, pointerEvents:'none',
        backgroundImage:'linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)',
        backgroundSize:'44px 44px',
      }} />

      {/* Floating orbs */}
      <div style={{ position:'fixed', top:'15%', left:'10%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(14,207,142,0.06) 0%,transparent 70%)', pointerEvents:'none', animation:'float 8s ease-in-out infinite' }} />
      <div style={{ position:'fixed', bottom:'20%', right:'8%', width:250, height:250, borderRadius:'50%', background:'radial-gradient(circle,rgba(110,180,255,0.05) 0%,transparent 70%)', pointerEvents:'none', animation:'float 10s ease-in-out 2s infinite' }} />

      <div className="card-in" style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}>
        <div className="glass" style={{ padding:'40px 36px' }}>

          {/* Logo */}
          <div style={{ textAlign:'center', marginBottom:36 }}>
            <div style={{
              width:60, height:60, borderRadius:18, margin:'0 auto 18px',
              background:'linear-gradient(135deg,rgba(14,207,142,0.25) 0%,rgba(7,168,113,0.15) 100%)',
              border:'1px solid rgba(14,207,142,0.3)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 0 0 1px rgba(14,207,142,0.15) inset, 0 8px 32px rgba(14,207,142,0.25), 0 2px 8px rgba(0,0,0,0.4)',
              position:'relative',
            }}>
              {/* Top sheen on logo */}
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'50%', borderRadius:'18px 18px 0 0', background:'linear-gradient(180deg,rgba(255,255,255,0.15) 0%,transparent 100%)', pointerEvents:'none' }} />
              <svg width="28" height="28" fill="none" stroke="#0ecf8e" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h1 style={{ fontFamily:'Manrope,sans-serif', fontSize:26, fontWeight:900, color:'#f0f6ff', letterSpacing:'-0.6px', marginBottom:8 }}>
              Cabana Finance
            </h1>
            <p style={{ fontSize:13, color:'var(--t3)', lineHeight:1.5 }}>
              Private Investment Transparency Platform
            </p>
          </div>

          {/* Divider */}
          <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)', margin:'0 0 28px' }} />

          <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:18 }}>

            {/* Username */}
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:8 }}>
                Username
              </label>
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--t4)', pointerEvents:'none' }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <input
                  type="text" required value={username} onChange={e=>setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="input"
                  style={{ paddingLeft:38, borderRadius:12 }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:8 }}>
                Password
              </label>
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--t4)', pointerEvents:'none' }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input
                  type={showPw?'text':'password'} required value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input"
                  style={{ paddingLeft:38, paddingRight:44, borderRadius:12 }}
                />
                <button type="button" onClick={()=>setShowPw(!showPw)} style={{
                  position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', color:'var(--t3)', padding:4, lineHeight:0,
                }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPw
                      ? <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></>
                      : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background:'rgba(255,107,138,0.08)', border:'1px solid rgba(255,107,138,0.2)', borderRadius:12, padding:'11px 14px', color:'#ff9ab3', fontSize:13, display:'flex', alignItems:'center', gap:8 }}>
                <span>⚠</span> {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width:'100%', padding:'14px', fontSize:15, borderRadius:12, marginTop:4 }}>
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', gap:9, justifyContent:'center' }}>
                  <span style={{ width:15, height:15, border:'2px solid rgba(0,0,0,0.2)', borderTopColor:'#021a10', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                  Signing in…
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:12, color:'var(--t4)', marginTop:24, lineHeight:1.6 }}>
            🔒 Access restricted to authorized Cabana users only
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes spin  { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}
