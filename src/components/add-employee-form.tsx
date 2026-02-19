'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createEmployee, type ActionState } from '@/app/actions/employees'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IconChevronDown } from '@tabler/icons-react'

// Leads passed from server
export default function AddEmployeeForm({ leads }: { leads: any[] }) {
  const [state, action, isPending] = useActionState<ActionState, FormData>(createEmployee, null)

  return (
    <div className="flex flex-1 flex-col p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Employee</h1>
      <Card className="max-w-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Employee Details</CardTitle>
          <p className="text-sm text-muted-foreground">Fill out the form below to create a new employee profile.</p>
        </CardHeader>
        <CardContent>
          {state && !state.success && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">{state.message}</div>
          )}
          <form action={action} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-blue-600 font-medium">Full Name</Label>
              <Input id="name" name="name" placeholder="Jane Doe" required disabled={isPending} className="bg-gray-50/50" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-600 font-medium">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="jane.doe@example.com" required disabled={isPending} className="bg-gray-50/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-blue-600 font-medium">Phone Number</Label>
                <Input id="phone" name="phone" placeholder="+1 (555) 123-4567" disabled={isPending} className="bg-gray-50/50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-blue-600 font-medium">Password</Label>
                <Input id="password" name="password" type="password" placeholder="Enter a secure password" disabled={isPending} className="bg-gray-50/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-blue-600 font-medium">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Re-enter password" disabled={isPending} className="bg-gray-50/50" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-blue-600 font-medium">Assigned Leads (Optional)</Label>
              <div className="relative">
                <select multiple className="w-full rounded-md border bg-gray-50/50 px-3 py-2 text-sm min-h-[100px] focus:outline-none focus:ring-1 focus:ring-blue-600" disabled={isPending}>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.fullName} &ndash; {lead.leadId || 'No ID'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">Hold Ctrl (or Cmd on Mac) to select multiple leads.</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Link href="/dashboard/employees"><Button type="button" variant="outline" className="px-6">Cancel</Button></Link>
              <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 px-6" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Employee'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
