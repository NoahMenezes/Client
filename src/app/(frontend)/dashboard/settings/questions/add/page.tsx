'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createFormField, type ActionState } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AddQuestionPage() {
  const [state, action, isPending] = useActionState<ActionState, FormData>(createFormField, null)

  return (
    <div className="flex flex-1 flex-col p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Custom Question</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Question Details</CardTitle>
          <p className="text-sm text-muted-foreground">Define a new field for the client intake form.</p>
        </CardHeader>
        <CardContent>
          {state && !state.success && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">{state.message}</div>
          )}
          <form action={action} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="label" className="text-blue-600">Question Label</Label>
              <Input id="label" name="label" placeholder="e.g. What is your budget?" required disabled={isPending} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fieldType" className="text-blue-600">Response Type</Label>
                <select id="fieldType" name="fieldType" className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600" disabled={isPending}>
                  <option value="text">Short Text</option>
                  <option value="textarea">Long Text / Paragraph</option>
                  <option value="number">Number</option>
                  <option value="date">Date Selection</option>
                  <option value="select">Dropdown (Select One)</option>
                  <option value="multi-select">Multi-Select Checkboxes</option>
                  <option value="checkbox">Single Checkbox (Yes/No)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder" className="text-blue-600">Sort Order</Label>
                <Input id="sortOrder" name="sortOrder" type="number" defaultValue="0" disabled={isPending} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="options" className="text-blue-600">Options (for Dropdown/Multi-select)</Label>
              <textarea id="options" name="options" rows={3}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="Enter options separated by new lines..." disabled={isPending} />
              <p className="text-xs text-muted-foreground">Only required if Response Type is Dropdown or Multi-Select.</p>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="required" name="required" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" disabled={isPending} />
              <Label htmlFor="required" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Mark as Required Field</Label>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Link href="/dashboard/settings"><Button type="button" variant="outline">Cancel</Button></Link>
              <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Question'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
