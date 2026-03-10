'use client'

import { useActionState, useState } from 'react'
import { Logo } from '@/components/logo'
import Link from 'next/link'
import { loginUser, type AuthState } from '@/app/actions/auth'

// ── Eye / EyeOff icons ────────────────────────────────────────────────────────
function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

// ── Main Login Component ──────────────────────────────────────────────────────
export default function Login() {
  const [state, action, isPending] = useActionState<AuthState, FormData>(loginUser, null)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <section className="auth-page">
      {/* Animated background orbs */}
      <div className="auth-bg" aria-hidden="true">
        <div className="auth-bg-orb auth-bg-orb-1" />
        <div className="auth-bg-orb auth-bg-orb-2" />
        <div className="auth-bg-orb auth-bg-orb-3" />
      </div>

      <div className="auth-container">
        {/* Logo */}
        <div className="auth-logo-wrap">
          <Link href="/" aria-label="Go home">
            <Logo className="auth-logo" uniColor={false} />
          </Link>
        </div>

        {/* Card */}
        <div className="auth-card">
          <div className="auth-card-header">
            <span className="auth-card-icon">💍</span>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your Perfect Knot account</p>
          </div>

          {/* Form error */}
          {state !== null && !state.success && (
            <div className="auth-error" role="alert">
              <span className="auth-error-icon">⚠️</span>
              <span>{state.message}</span>
            </div>
          )}

          {/* Email / Password Form */}
          <form action={action} className="auth-form" id="login-form">
            <div className="auth-field">
              <label htmlFor="login-email" className="auth-label">
                Email address
              </label>
              <input
                type="email"
                id="login-email"
                name="email"
                className="auth-input"
                placeholder="you@example.com"
                required
                disabled={isPending}
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="login-password" className="auth-label">
                  Password
                </label>
              </div>
              <div className="auth-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  name="password"
                  className="auth-input auth-input-padded-right"
                  placeholder="Enter your password"
                  required
                  disabled={isPending}
                  minLength={8}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="btn-login-submit"
              className="auth-btn-primary"
              disabled={isPending}
              aria-busy={isPending}
            >
              {isPending ? (
                <>
                  <span className="auth-spinner" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Switch link */}
          <div className="auth-switch">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="auth-link">
              Create one
            </Link>
          </div>
        </div>

        <p className="auth-footer">
          © {new Date().getFullYear()} Perfect Knot CRM. All rights reserved.
        </p>
      </div>
    </section>
  )
}
