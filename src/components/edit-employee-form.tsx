'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { updateEmployee, type ActionState } from '@/app/actions/employees'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function EditEmployeeClient({ employee }: { employee: any }) {
  const [state, action, isPending] = useActionState<ActionState, FormData>(updateEmployee, null)

  return (
    <div className="flex flex-1 flex-col p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Employee – {employee.name}</h1>
      <Card className="max-w-2xl">
        <CardHeader><CardTitle className="text-lg">Employee Details</CardTitle></CardHeader>
        <CardContent>
          {state && !state.success && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">{state.message}</div>
          )}
          <form action={action} className="space-y-5">
            <input type="hidden" name="id" value={String(employee.id)} />
            <div className="space-y-2">
              <Label htmlFor="name" className="text-blue-600">Full Name</Label>
              <Input id="name" name="name" defaultValue={employee.name} required disabled={isPending} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-600">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={employee.email} required disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-blue-600">Phone</Label>
                <Input id="phone" name="phone" defaultValue={employee.phone || ''} disabled={isPending} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-blue-600">Role</Label>
                <Input id="role" name="role" defaultValue={employee.role || ''} disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="text-blue-600">Department</Label>
                <Input id="department" name="department" defaultValue={employee.department || ''} disabled={isPending} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-blue-600">Status</Label>
              <select id="status" name="status" defaultValue={employee.status || 'active'} className="w-full rounded-md border bg-background px-3 py-2 text-sm" disabled={isPending}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-blue-600">Notes</Label>
              <textarea id="notes" name="notes" rows={3} defaultValue={employee.notes || ''}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none" disabled={isPending} />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Link href="/dashboard/employees"><Button type="button" variant="outline">Cancel</Button></Link>
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
