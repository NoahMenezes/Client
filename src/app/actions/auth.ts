'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type AuthState = {
  success: boolean
  message: string
} | null

// ── helpers ─────────────────────────────────────────────────────────────────

async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('payload-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  })
}

// ── Login ────────────────────────────────────────────────────────────────────

export async function loginUser(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, message: 'Email and password are required.' }
  }

  let shouldRedirect = false

  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.login({
      collection: 'users',
      data: { email: email.toLowerCase().trim(), password },
    })

    if (result.token) {
      await setAuthCookie(result.token)
      shouldRedirect = true
    }
  } catch (error: unknown) {
    console.error('[loginUser] error:', error)
    const msg = error instanceof Error ? error.message : String(error)

    if (
      msg.toLowerCase().includes('the email or password') ||
      msg.toLowerCase().includes('unauthorized') ||
      msg.toLowerCase().includes('invalid')
    ) {
      return { success: false, message: 'Incorrect email or password. Please try again.' }
    }

    return { success: false, message: 'Something went wrong. Please try again.' }
  }

  if (shouldRedirect) redirect('/dashboard')

  return { success: false, message: 'Login failed. Please try again.' }
}

// ── Register (Sign Up) ────────────────────────────────────────────────────────

export async function registerUser(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!name || !email || !password) {
    return { success: false, message: 'All fields are required.' }
  }

  if (password.length < 8) {
    return { success: false, message: 'Password must be at least 8 characters.' }
  }

  if (password !== confirmPassword) {
    return { success: false, message: 'Passwords do not match.' }
  }

  let shouldRedirect = false

  try {
    const payload = await getPayload({ config: configPromise })

    // Reject if account already exists
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: email.toLowerCase().trim() } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      return {
        success: false,
        message: 'An account with this email already exists. Please log in instead.',
      }
    }

    // Create the user
    await payload.create({
      collection: 'users',
      data: {
        email: email.toLowerCase().trim(),
        password,
        name: name.trim(),
        role: 'admin',
      },
      overrideAccess: true,
    })

    // Auto-login after registration
    const result = await payload.login({
      collection: 'users',
      data: { email: email.toLowerCase().trim(), password },
    })

    if (result.token) {
      await setAuthCookie(result.token)
      shouldRedirect = true
    }
  } catch (error: unknown) {
    console.error('[registerUser] error:', error)
    const msg = error instanceof Error ? error.message : String(error)

    if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('unique')) {
      return { success: false, message: 'An account with this email already exists.' }
    }

    return { success: false, message: 'Something went wrong. Please try again.' }
  }

  if (shouldRedirect) redirect('/dashboard')

  return { success: false, message: 'Registration failed. Please try again.' }
}

// ── Logout (clears session) ──────────────────────────────────────────────────

export async function logout() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('payload-token')
  } catch (e) {
    console.error('[logout] error:', e)
  }

  revalidatePath('/')
  redirect('/login')
}
