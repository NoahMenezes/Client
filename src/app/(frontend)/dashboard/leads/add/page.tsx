'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createLead, type ActionState } from '@/app/actions/leads'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const SERVICES = ['Venue Decoration', 'Catering', 'Photography', 'DJ & Music', 'Makeup & Styling', 'Invitations']

export default function AddLeadPage() {
  const [state, action, isPending] = useActionState<ActionState, FormData>(createLead, null)

  return (
    <div className="flex flex-1 flex-col p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Lead</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Lead Details</CardTitle>
          <p className="text-sm text-muted-foreground">Fill out the form below to create a new lead.</p>
        </CardHeader>
        <CardContent>
          {state && !state.success && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">{state.message}</div>
          )}
          <form action={action} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-blue-600">Full Name</Label>
              <Input id="fullName" name="fullName" placeholder="Jane Doe" required disabled={isPending} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-600">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="jane@example.com" required disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-blue-600">Phone Number</Label>
                <Input id="phone" name="phone" placeholder="+91 12345 67890" disabled={isPending} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-blue-600">Status</Label>
              <select id="status" name="status" className="w-full rounded-md border bg-background px-3 py-2 text-sm" disabled={isPending}>
                <option value="opportunity">Opportunity</option>
                <option value="prospect">Prospect</option>
                <option value="in-progress">In Progress</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkInDate" className="text-blue-600">Check-in Date</Label>
                <Input id="checkInDate" name="checkInDate" type="date" disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOutDate" className="text-blue-600">Check-out Date</Label>
                <Input id="checkOutDate" name="checkOutDate" type="date" disabled={isPending} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-blue-600">Services Requested</Label>
              <div className="grid grid-cols-2 gap-2">
                {SERVICES.map((s) => (
                  <label key={s} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="servicesRequested" value={s} disabled={isPending} className="rounded" />
                    {s}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="internalNotes" className="text-blue-600">Internal Notes</Label>
              <textarea id="internalNotes" name="internalNotes" rows={3}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Add notes here..." disabled={isPending} />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Link href="/dashboard"><Button type="button" variant="outline">Cancel</Button></Link>
              <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Lead'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
