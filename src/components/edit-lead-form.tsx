'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { updateLead, type ActionState } from '@/app/actions/leads'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const SERVICES = ['Venue Decoration', 'Catering', 'Photography', 'DJ & Music', 'Makeup & Styling', 'Invitations']

export default function EditLeadClient({ lead }: { lead: any }) {
  const [state, action, isPending] = useActionState<ActionState, FormData>(updateLead, null)

  return (
    <div className="flex flex-1 flex-col p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Lead – {lead.fullName}</h1>
      <Card className="max-w-2xl">
        <CardHeader><CardTitle className="text-lg">Lead Details</CardTitle></CardHeader>
        <CardContent>
          {state && !state.success && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">{state.message}</div>
          )}
          <form action={action} className="space-y-5">
            <input type="hidden" name="id" value={String(lead.id)} />
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-blue-600">Full Name</Label>
              <Input id="fullName" name="fullName" defaultValue={lead.fullName} required disabled={isPending} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-600">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={lead.email} required disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-blue-600">Phone</Label>
                <Input id="phone" name="phone" defaultValue={lead.phone || ''} disabled={isPending} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-blue-600">Status</Label>
              <select id="status" name="status" defaultValue={lead.status} className="w-full rounded-md border bg-background px-3 py-2 text-sm" disabled={isPending}>
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
                <Input id="checkInDate" name="checkInDate" type="date" defaultValue={lead.checkInDate || ''} disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOutDate" className="text-blue-600">Check-out Date</Label>
                <Input id="checkOutDate" name="checkOutDate" type="date" defaultValue={lead.checkOutDate || ''} disabled={isPending} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-blue-600">Services Requested</Label>
              <div className="grid grid-cols-2 gap-2">
                {SERVICES.map((s) => (
                  <label key={s} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="servicesRequested" value={s} defaultChecked={(lead.servicesRequested || []).includes(s)} disabled={isPending} className="rounded" />
                    {s}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="internalNotes" className="text-blue-600">Internal Notes</Label>
              <textarea id="internalNotes" name="internalNotes" rows={3} defaultValue={lead.internalNotes || ''}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none" disabled={isPending} />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Link href={`/dashboard/leads/${lead.id}`}><Button type="button" variant="outline">Cancel</Button></Link>
              <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
