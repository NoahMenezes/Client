'use client'

import { useActionState } from 'react'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { loginUser, type AuthState } from '@/app/actions/auth'

export default function Login() {
  const [state, action, isPending] = useActionState<AuthState, FormData>(loginUser, null)

  return (
    <section className="bg-background grid min-h-screen grid-rows-[auto_1fr] px-4">
      <div className="mx-auto w-full max-w-7xl border-b py-3">
        <Link
          href="/"
          aria-label="go home"
          className="inline-block border-t-2 border-transparent py-3"
        >
          <Logo className="w-fit" />
        </Link>
      </div>

      <div className="m-auto w-full max-w-sm">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-medium">Welcome back</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Sign in or create an account to continue
          </p>
        </div>

        <Card className="mt-6 p-8">
          {/* Error banner */}
          {state !== null && !state.success && (
            <div className="mb-5 rounded-xl px-4 py-3 text-sm bg-red-50 text-red-800 ring-1 ring-red-200">
              <p>{state.message}</p>
            </div>
          )}

          <form action={action} className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm">
                  Password
                </Label>
              </div>
              <Input
                type="password"
                id="password"
                name="password"
                required
                disabled={isPending}
                minLength={8}
              />
            </div>

            <Button className="w-full" disabled={isPending} aria-busy={isPending}>
              {isPending ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </Card>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </section>
  )
}
