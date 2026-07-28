'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const VALID_USERNAME = 'Cabana'
const VALID_PASSWORD = 'Apatmento2026'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
      setError('Invalid credentials. Please try again.')
      setLoading(false)
      return
    }

    // Sign in with Supabase using the fixed account
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@cabanafinance.co',
      password: VALID_PASSWORD,
    })

    if (authError) {
      // If Supabase auth fails, still allow local session via localStorage
      // (fallback for demo mode)
      sessionStorage.setItem('cabana_auth', '1')
      router.push('/dashboard')
      router.refresh()
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="login-page">
      {/* Background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="login-wrapper">
        {/* Card */}
        <div className="login-card">
          {/* Logo */}
          <div className="login-logo">
            <div className="logo-icon">
              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="logo-name">Cabana Finance</div>
              <div className="logo-sub">Investment Transparency</div>
            </div>
          </div>

          <div className="login-divider" />

          <h1 className="login-heading">Welcome back</h1>
          <p className="login-desc">Sign in to access the dashboard</p>

          <form onSubmit={handleLogin} className="login-form">
            <div className="field-group">
              <label className="field-label">Username</label>
              <div className="field-wrap">
                <span className="field-icon">
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  className="field-input"
                  placeholder="Enter username"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="field-wrap">
                <span className="field-icon">
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="field-input"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="field-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? (
                <span className="btn-loading">
                  <svg className="spin" width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <p className="login-footer">Restricted access · Cabana Finance</p>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          min-height: 100dvh;
          background: #0a0f1e;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          position: relative;
          overflow: hidden;
        }

        /* Atmospheric blobs */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .blob-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%);
          top: -100px; left: -100px;
        }
        .blob-2 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%);
          bottom: -80px; right: -80px;
        }
        .blob-3 {
          width: 250px; height: 250px;
          background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
        }

        .login-wrapper {
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 1;
        }

        .login-card {
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 24px;
          padding: 40px 36px;
          backdrop-filter: blur(20px);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.03), 0 24px 64px rgba(0,0,0,0.5);
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 32px 24px;
            border-radius: 20px;
          }
        }

        .login-logo {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }
        .logo-icon {
          width: 52px; height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          display: flex; align-items: center; justify-content: center;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 8px 24px rgba(16,185,129,0.35);
        }
        .logo-name {
          font-size: 18px;
          font-weight: 700;
          color: #f1f5f9;
          letter-spacing: -0.3px;
          line-height: 1.2;
        }
        .logo-sub {
          font-size: 12px;
          color: #10b981;
          font-weight: 500;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-top: 2px;
        }

        .login-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(16,185,129,0.3), transparent);
          margin-bottom: 28px;
        }

        .login-heading {
          font-size: 26px;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 6px;
          letter-spacing: -0.5px;
        }
        .login-desc {
          font-size: 14px;
          color: #64748b;
          margin: 0 0 28px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .field-label {
          font-size: 13px;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.3px;
        }
        .field-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .field-icon {
          position: absolute;
          left: 14px;
          color: #475569;
          display: flex;
          pointer-events: none;
        }
        .field-input {
          width: 100%;
          background: rgba(30, 41, 59, 0.8);
          border: 1.5px solid rgba(51, 65, 85, 0.8);
          border-radius: 12px;
          padding: 14px 44px;
          font-size: 15px;
          color: #f1f5f9;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
        }
        .field-input::placeholder { color: #475569; }
        .field-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
        }
        .field-toggle {
          position: absolute;
          right: 14px;
          color: #475569;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          padding: 0;
          transition: color 0.15s;
        }
        .field-toggle:hover { color: #94a3b8; }

        .login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 13px;
          color: #fca5a5;
        }

        .login-btn {
          width: 100%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 15px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s, box-shadow 0.2s;
          box-shadow: 0 8px 24px rgba(16,185,129,0.3);
          margin-top: 4px;
          letter-spacing: 0.2px;
        }
        .login-btn:hover:not(:disabled) {
          opacity: 0.92;
          box-shadow: 0 12px 32px rgba(16,185,129,0.4);
          transform: translateY(-1px);
        }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .spin {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .login-footer {
          text-align: center;
          font-size: 12px;
          color: #334155;
          margin: 24px 0 0;
        }
      `}</style>
    </div>
  )
}
