'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
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
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 50%, rgba(16,185,129,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(96,165,250,0.05) 0%, transparent 60%), #080d1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      {/* Background grid */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

      <div className="card-enter" style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        <div className="card" style={{ padding: '36px 32px' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 28px rgba(16,185,129,0.35)',
            }}>
              <svg width="26" height="26" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 24, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px', marginBottom: 6 }}>
              Cabana Finance
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Private Investment Transparency Platform</p>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 0 24px' }} />

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: 7 }}>Username</label>
              <input
                type="text" required value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                className="input"
                style={{ background: 'rgba(15,23,42,0.9)', border: '1.5px solid rgba(51,65,85,0.7)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: '#f8fafc', outline: 'none', width: '100%', fontFamily: 'Inter,sans-serif' }}
                onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.12)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(51,65,85,0.7)'; e.target.style.boxShadow = 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: 7 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  style={{ background: 'rgba(15,23,42,0.9)', border: '1.5px solid rgba(51,65,85,0.7)', borderRadius: 10, padding: '12px 42px 12px 14px', fontSize: 14, color: '#f8fafc', outline: 'none', width: '100%', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box' as const, transition: 'all 0.18s' }}
                  onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(51,65,85,0.7)'; e.target.style.boxShadow = 'none' }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#334155', padding: 0 }}>
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '11px 14px', color: '#fca5a5', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                ⚠ {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '13px', fontSize: 15, marginTop: 4, borderRadius: 11 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  Signing in…
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-4)', marginTop: 20 }}>
            Access restricted to authorized users only
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
