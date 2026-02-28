import { redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Login from '@/components/login-1'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sign In – Perfect Knot CRM',
  description: 'Sign in to your Perfect Knot CRM account.',
}

export default async function LoginPage() {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })
    if (user) redirect('/dashboard')
  } catch {
    // Show login on any auth error
  }

  return <Login />
}
