'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createEmployee, type ActionState } from '@/app/actions/employees'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AddEmployeeForm() {
  const [state, action, isPending] = useActionState<ActionState, FormData>(createEmployee, null)

  return (
    <div className="flex flex-1 flex-col p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Employee</h1>
      <Card className="max-w-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Employee Details</CardTitle>
          <p className="text-sm text-muted-foreground">
            Fill out the form below to create a new employee profile.
          </p>
        </CardHeader>
        <CardContent>
          {state && !state.success && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">
              {state.message}
            </div>
          )}
          <form action={action} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-blue-600 font-medium">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Jane Doe"
                required
                disabled={isPending}
                className="bg-gray-50/50"
              />
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-600 font-medium">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jane.doe@example.com"
                  required
                  disabled={isPending}
                  className="bg-gray-50/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-blue-600 font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+91 98765 43210"
                  disabled={isPending}
                  className="bg-gray-50/50"
                />
              </div>
            </div>

            {/* Role + Department */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-blue-600 font-medium">
                  Role
                </Label>
                <Input
                  id="role"
                  name="role"
                  placeholder="e.g. Event Coordinator"
                  disabled={isPending}
                  className="bg-gray-50/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="text-blue-600 font-medium">
                  Department
                </Label>
                <Input
                  id="department"
                  name="department"
                  placeholder="e.g. Operations"
                  disabled={isPending}
                  className="bg-gray-50/50"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-blue-600 font-medium">
                Status
              </Label>
              <select
                id="status"
                name="status"
                className="w-full rounded-md border bg-gray-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                disabled={isPending}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-blue-600 font-medium">
                Notes
              </Label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="w-full rounded-md border bg-gray-50/50 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="Any additional notes about this employee..."
                disabled={isPending}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Link href="/dashboard/employees">
                <Button type="button" variant="outline" className="px-6">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700 px-6"
                disabled={isPending}
              >
                {isPending ? 'Saving...' : 'Save Employee'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
