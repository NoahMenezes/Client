import { redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Login from '@/components/login-1'

export const dynamic = 'force-dynamic'


export default async function HomePage() {
  let shouldRedirect = false

  try {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (user) {
      shouldRedirect = true
    }
  } catch (e) {
    console.error('[HomePage] Auth check failed:', e)
    // Show login page even if DB check fails
  }

  // redirect() must be called outside try/catch — it throws a NEXT_REDIRECT
  // error internally, which would be caught by the try/catch and swallowed
  if (shouldRedirect) {
    redirect('/dashboard')
  }

  return <Login />
}
