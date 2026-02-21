'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { IconPencil, IconTrash } from '@tabler/icons-react'
import { deleteService, deleteFormField } from '@/app/actions/settings'
import { SiteHeader } from '@/components/site-header'


// ─── Types ──────────────────────────────────────────────────────────────────

export interface Service {
  id: string | number
  serviceName: string
  category: string
  price: number
  description?: string | null
}

export interface FormField {
  id: string | number
  label: string
  fieldType: string
  required?: boolean
}



function badgeClass(fieldType: string) {
  if (['text', 'textarea'].includes(fieldType)) return 'bg-purple-100 text-purple-700'
  if (fieldType === 'number') return 'bg-blue-100 text-blue-700'
  if (fieldType === 'date') return 'bg-green-100 text-green-700'
  return 'bg-gray-100 text-gray-700'
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const servicesList: Service[] = []
  const formFieldsList: FormField[] = []

  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<div className="h-12 border-b bg-white" />}>
        <SiteHeader title="Settings" />
      </Suspense>
      <div className="flex flex-1 flex-col p-6 space-y-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        {/* Price Management Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Price Management</CardTitle>
              <CardDescription className="mt-1.5">
                Manage the services you offer and their base prices.
              </CardDescription>
            </div>
            <Link href="/dashboard/services/add">
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                + Add New Service
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b text-xs uppercase text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium">Service Name</th>
                    <th className="px-4 py-3 text-left font-medium">Category</th>
                    <th className="px-4 py-3 text-left font-medium">Base Price</th>
                    <th className="px-4 py-3 text-left font-medium">Description</th>
                    <th className="px-4 py-3 text-right font-medium w-25">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {servicesList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">
                        No services found.
                      </td>
                    </tr>
                  ) : (
                    servicesList.map((s: any) => (
                      <tr
                        key={s.id}
                        className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium">{s.serviceName}</td>
                        <td className="px-4 py-3 capitalize text-muted-foreground">{s.category}</td>
                        <td className="px-4 py-3 font-medium">
                          ₹{s.price.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground truncate max-w-50">
                          {s.description || '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/dashboard/services/${s.id}/edit`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <IconPencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <form action={deleteService}>
                              <input type="hidden" name="id" value={s.id} />
                              <Button
                                type="submit"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                              >
                                <IconTrash className="h-4 w-4" />
                              </Button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Custom Form Builder Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Custom Form Builder</CardTitle>
              <CardDescription className="mt-1.5">
                Admin can create custom questions for the client intake form.
              </CardDescription>
            </div>
            <Link href="/dashboard/settings/questions/add">
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                + Add New Question
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formFieldsList.length === 0 ? (
                <div className="text-center p-8 border rounded-md border-dashed text-muted-foreground">
                  No custom questions yet. Click &quot;Add New Question&quot; to create one.
                </div>
              ) : (
                formFieldsList.map((f: any) => {
                  const bClass = badgeClass(f.fieldType)

                  return (
                    <div
                      key={f.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-white hover:border-blue-200 transition-colors group"
                    >
                      <div>
                        <h4 className="font-medium text-sm text-gray-900">{f.label}</h4>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${bClass}`}
                          >
                            {f.fieldType}
                          </span>
                          {f.required && (
                            <span className="text-[10px] text-red-500 font-medium bg-red-50 px-1.5 py-0.5 rounded">
                              Required
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                        >
                          <IconPencil className="h-4 w-4" />
                        </Button>
                        <form action={deleteFormField}>
                          <input type="hidden" name="id" value={f.id} />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
