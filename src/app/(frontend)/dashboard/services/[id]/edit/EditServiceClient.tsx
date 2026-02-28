'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { updateService, type ActionState } from '@/app/actions/services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function EditServiceClient({ service }: { service: any }) {
  const [state, action, isPending] = useActionState<ActionState, FormData>(updateService, null)

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard/settings" className="text-gray-400 hover:text-gray-700 text-sm">
          ← Back to Settings
        </Link>
        <h1 className="text-2xl font-bold">Edit Service</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Service Details</CardTitle>
          <p className="text-sm text-muted-foreground">Update this service in the catalog.</p>
        </CardHeader>
        <CardContent>
          {state && !state.success && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">
              {state.message}
            </div>
          )}
          <form action={action} className="space-y-5">
            <input type="hidden" name="id" value={String(service.id)} />

            <div className="space-y-2">
              <Label htmlFor="serviceName" className="text-blue-600">
                Service Name
              </Label>
              <Input
                id="serviceName"
                name="serviceName"
                defaultValue={service.name}
                placeholder="e.g. Bronze Package"
                required
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-blue-600">
                  Category
                </Label>
                <input
                  id="category"
                  name="category"
                  defaultValue={
                    typeof service.category === 'object' && service.category
                      ? service.category.id
                      : (service.category ?? '')
                  }
                  type="hidden"
                />
                <Input
                  id="categoryDisplay"
                  defaultValue={
                    typeof service.category === 'object' && service.category
                      ? service.category.name
                      : ''
                  }
                  placeholder="Category"
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="is_active" className="text-blue-600">
                  Status
                </Label>
                <select
                  id="is_active"
                  name="is_active"
                  defaultValue={service.is_active !== false ? 'true' : 'false'}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                  disabled={isPending}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-blue-600">
                Price (₹)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                defaultValue={service.base_price}
                placeholder="0.00"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-blue-600">
                Description
              </Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={service.description || ''}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="Description..."
                disabled={isPending}
              />
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t">
              <Link href="/dashboard/settings">
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={isPending}
              >
                {isPending ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
