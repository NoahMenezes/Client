'use client'

import { useActionState, useState } from 'react'
import { Logo } from '@/components/logo'
import Link from 'next/link'
import { registerUser, type AuthState } from '@/app/actions/auth'

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

// ── Password strength meter ───────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null

  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', '#EF4444', '#F97316', '#EAB308', '#22C55E']

  return (
    <div className="auth-strength">
      <div className="auth-strength-bars">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="auth-strength-bar"
            style={{ background: i <= score ? colors[score] : 'rgba(255,255,255,0.12)' }}
          />
        ))}
      </div>
      <span className="auth-strength-label" style={{ color: colors[score] }}>
        {labels[score]}
      </span>
    </div>
  )
}

// ── Main Sign Up Component ────────────────────────────────────────────────────
export default function SignUp() {
  const [state, action, isPending] = useActionState<AuthState, FormData>(registerUser, null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState('')

  return (
    <section className="auth-page">
      {/* Animated background orbs */}
      <div className="auth-bg" aria-hidden="true">
        <div className="auth-bg-orb auth-bg-orb-1" />
        <div className="auth-bg-orb auth-bg-orb-2" />
        <div className="auth-bg-orb auth-bg-orb-3" />
      </div>

      <div className="auth-container auth-container-wide">
        {/* Logo */}
        <div className="auth-logo-wrap">
          <Link href="/" aria-label="Go home">
            <Logo className="auth-logo" uniColor={false} />
          </Link>
        </div>

        {/* Card */}
        <div className="auth-card">
          <div className="auth-card-header">
            <span className="auth-card-icon">✨</span>
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">Start managing weddings beautifully</p>
          </div>

          {/* Form error - Displayed if the server action returns an unsuccessful state */}
          {state !== null && !state.success && (
            <div className="auth-error animate-in fade-in slide-in-from-top-1" role="alert">
              <span className="auth-error-icon">⚠️</span>
              <span>{state.message}</span>
            </div>
          )}

          {/* Sign-Up Form */}
          <form action={action} className="auth-form" id="signup-form">
            <div className="auth-field">
              <label htmlFor="signup-name" className="auth-label">
                Full name
              </label>
              <input
                type="text"
                id="signup-name"
                name="name"
                className="auth-input"
                placeholder="Jane Smith"
                required
                disabled={isPending}
                autoComplete="name"
                autoFocus
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email" className="auth-label">
                Email address
              </label>
              <input
                type="email"
                id="signup-email"
                name="email"
                className="auth-input"
                placeholder="you@example.com"
                required
                disabled={isPending}
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-password" className="auth-label">
                Password
              </label>
              <div className="auth-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="signup-password"
                  name="password"
                  className="auth-input auth-input-padded-right"
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  disabled={isPending}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <PasswordStrength password={password} />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-confirm" className="auth-label">
                Confirm password
              </label>
              <div className="auth-input-wrap">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  id="signup-confirm"
                  name="confirmPassword"
                  className="auth-input auth-input-padded-right"
                  placeholder="Repeat your password"
                  required
                  minLength={8}
                  disabled={isPending}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex={-1}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon visible={showConfirm} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="btn-signup-submit"
              className="auth-btn-primary"
              disabled={isPending}
              aria-busy={isPending}
            >
              {isPending ? (
                <>
                  <span className="auth-spinner" aria-hidden="true" />
                  <span>Creating account…</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Switch link */}
          <div className="auth-switch">
            Already have an account?{' '}
            <Link href="/login" className="auth-link">
              Sign in
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
