import Login from '@/components/login-1'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sign In – Perfect Knot CRM',
  description: 'Sign in to your Perfect Knot CRM account.',
}

export default function LoginPage() {
  return <Login />
}
