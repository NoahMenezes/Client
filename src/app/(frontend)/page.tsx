import { redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let user = null;

  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const result = await payload.auth({ headers })
    user = result.user
  } catch (e) {
    console.error('[HomePage] Auth check failed:', e)
  }

  if (user) {
    redirect('/dashboard')
  }

  // Not authenticated — go to login
  redirect('/login')
}
