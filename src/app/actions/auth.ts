'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type AuthState = {
  success: boolean
  message: string
  isExisting?: boolean
} | null

export async function registerUser(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, message: 'Email and password are required.' }
  }

  if (password.length < 8) {
    return { success: false, message: 'Password must be at least 8 characters long.' }
  }

  let shouldRedirect = false

  try {
    const payload = await getPayload({ config: configPromise })

    // Check if user already exists
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: email.toLowerCase().trim() } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs === 0) {
      // Derive a display name from the email (e.g. "noah" from "noah@example.com")
      const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

      // Create the new user — Payload hashes the password automatically
      await payload.create({
        collection: 'users',
        data: {
          email: email.toLowerCase().trim(),
          password,
          name,
          role: 'admin',
        },
        overrideAccess: true,
      })
    }

    // Log the user in (works for both new and existing users)
    const result = await payload.login({
      collection: 'users',
      data: {
        email: email.toLowerCase().trim(),
        password,
      },
    })

    if (result.token) {
      const cookieStore = await cookies()
      cookieStore.set('payload-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
      })
      shouldRedirect = true
    }
  } catch (error: unknown) {
    console.error('[registerUser] error:', error)
    const msg = error instanceof Error ? error.message : String(error)

    // Wrong password for existing account
    if (
      msg.toLowerCase().includes('the email or password') ||
      msg.toLowerCase().includes('unauthorized') ||
      msg.toLowerCase().includes('invalid')
    ) {
      return {
        success: false,
        message: 'Incorrect password for this account. Please try again.',
      }
    }

    // Duplicate key errors
    if (
      msg.toLowerCase().includes('duplicate') ||
      msg.toLowerCase().includes('unique') ||
      msg.toLowerCase().includes('already exists')
    ) {
      return {
        success: false,
        isExisting: true,
        message: 'An account with this email already exists.',
      }
    }

    return {
      success: false,
      message: 'Something went wrong. Please try again.',
    }
  }

  // redirect() must be called outside try/catch (it throws internally)
  if (shouldRedirect) {
    redirect('/dashboard')
  }

  return { success: false, message: 'Login failed. Please try again.' }
}

export async function logout() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('payload-token')
  } catch (e) {
    console.error('[logout] error:', e)
  }
  revalidatePath('/')
  redirect('/')
}
