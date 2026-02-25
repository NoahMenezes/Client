import { redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Login from '@/components/login-1'

export default async function HomePage() {
  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (user) {
      redirect('/dashboard')
    }
  } catch (e) {
    console.error('[HomePage] Auth check failed:', e)
    // Show login page even if DB check fails
  }

  return <Login />
}
