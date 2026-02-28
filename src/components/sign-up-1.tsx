'use client'

import { useActionState } from 'react'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { registerUser, type AuthState } from '@/app/actions/auth'

export default function SignUp() {
    const [state, action, isPending] = useActionState<AuthState, FormData>(registerUser, null)

    return (
        <section className="bg-background grid min-h-screen grid-rows-[auto_1fr] px-4">
            <div className="mx-auto w-full max-w-7xl border-b py-3">
                <Link
                    href="/"
                    aria-label="go home"
                    className="inline-block border-t-2 border-transparent py-3">
                    <Logo className="w-fit" />
                </Link>
            </div>

            <div className="m-auto w-full max-w-sm">
                <div className="text-center">
                    <h1 className="font-serif text-4xl font-medium">Create an account</h1>
                    <p className="text-muted-foreground mt-2 text-sm">Get started with your free account today</p>
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
                            <Label htmlFor="name" className="text-sm">Full Name</Label>
                            <Input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Jane Smith"
                                required
                                disabled={isPending}
                                autoComplete="name"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="email" className="text-sm">Email</Label>
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="you@example.com"
                                required
                                disabled={isPending}
                                autoComplete="email"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="password" className="text-sm">Password</Label>
                            <Input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Min. 8 characters"
                                required
                                minLength={8}
                                disabled={isPending}
                                autoComplete="new-password"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                            <Input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Repeat your password"
                                required
                                minLength={8}
                                disabled={isPending}
                                autoComplete="new-password"
                            />
                        </div>

                        <Button className="w-full" disabled={isPending} aria-busy={isPending}>
                            {isPending ? 'Creating account…' : 'Create Account'}
                        </Button>
                    </form>
                </Card>

                <p className="text-muted-foreground mt-6 text-center text-sm">
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        className="text-primary font-medium hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </section>
    )
}
