'use client'

import React from 'react'
import Link from 'next/link'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createLead, type ActionState } from '@/app/actions/leads'

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b pb-2 mb-4 mt-6 first:mt-0">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{children}</h3>
    </div>
  )
}

export default function AddLeadPage() {
  const [state, action, isPending] = useActionState<ActionState, FormData>(createLead, null)

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-700 text-sm">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold">Add New Lead</h1>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="text-lg">Lead Details</CardTitle>
          <p className="text-sm text-muted-foreground">
            Fill out the form below to create a new lead. Fields marked with * are required.
          </p>
        </CardHeader>
        <CardContent>
          {state !== null && !state.success && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">
              {state.message}
            </div>
          )}

          <form action={action} className="space-y-0">
            {/* ── Contact Information ── */}
            <SectionHeading>Contact Information</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-blue-600">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="e.g. Eleanor Vance"
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-600">
                  Email *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-blue-600">
                  Phone
                </Label>
                <Input id="phone" name="phone" placeholder="+91 98765 43210" disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leadSource" className="text-blue-600">
                  Lead Source
                </Label>
                <Input
                  id="leadSource"
                  name="leadSource"
                  placeholder="e.g. Google Form, Instagram"
                  disabled={isPending}
                />
              </div>
            </div>

            {/* ── Lead Details ── */}
            <SectionHeading>Lead Details</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-blue-600">
                  Status
                </Label>
                <select
                  id="status"
                  name="status"
                  defaultValue="new"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                  disabled={isPending}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="proposal_sent">Proposal Sent</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="closed">Closed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-blue-600">
                  Budget (₹)
                </Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  placeholder="e.g. 500000"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestCount" className="text-blue-600">
                  Guest Count
                </Label>
                <Input
                  id="guestCount"
                  name="guestCount"
                  type="number"
                  placeholder="e.g. 200"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="weddingStyle" className="text-blue-600">
                  Wedding Style
                </Label>
                <Input
                  id="weddingStyle"
                  name="weddingStyle"
                  placeholder="e.g. Traditional, Modern, etc."
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2 flex items-end gap-2 pb-1">
                <input
                  type="checkbox"
                  id="isDestination"
                  name="isDestination"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isPending}
                />
                <Label htmlFor="isDestination" className="text-blue-600 cursor-pointer">
                  Destination Wedding?
                </Label>
              </div>
            </div>

            {/* ── Event Dates ── */}
            <SectionHeading>Event Dates</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="checkInDate" className="text-blue-600">
                  Check-in Date
                </Label>
                <Input id="checkInDate" name="checkInDate" type="date" disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOutDate" className="text-blue-600">
                  Check-out Date
                </Label>
                <Input id="checkOutDate" name="checkOutDate" type="date" disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weddingDate" className="text-blue-600">
                  Wedding / Event Date
                </Label>
                <Input id="weddingDate" name="weddingDate" type="date" disabled={isPending} />
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Link href="/dashboard">
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={isPending}
              >
                {isPending ? 'Saving…' : 'Save Lead'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
