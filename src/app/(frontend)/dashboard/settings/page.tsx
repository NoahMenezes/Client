'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

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

interface Props {
  services?: Service[]
  formFields?: FormField[]
}

function badgeClass(fieldType: string) {
  if (['text', 'textarea'].includes(fieldType)) return 'bg-purple-100 text-purple-700'
  if (fieldType === 'number') return 'bg-blue-100 text-blue-700'
  if (fieldType === 'date') return 'bg-green-100 text-green-700'
  return 'bg-gray-100 text-gray-700'
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SettingsPage({ services = [], formFields = [] }: Props) {
  const [localServices, setLocalServices] = useState<Service[]>(services)
  const [localFormFields, setLocalFormFields] = useState<FormField[]>(formFields)

  const handleDeleteService = (id: string | number) => {
    setLocalServices((prev) => prev.filter((s) => s.id !== id))
  }

  const handleDeleteField = (id: string | number) => {
    setLocalFormFields((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <div className="flex flex-1 flex-col p-6 space-y-8">
      <div className="flex items-center gap-2">
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Price Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Price Management</CardTitle>
            <CardDescription className="mt-1.5">
              Manage the services you offer and their base prices.
            </CardDescription>
          </div>
          <Link href="/dashboard/services/add">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">+ Add New Service</Button>
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
                  <th className="px-4 py-3 text-right font-medium w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {localServices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground text-sm">
                      No services found.
                    </td>
                  </tr>
                ) : (
                  localServices.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{s.serviceName}</td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">{s.category}</td>
                      <td className="px-4 py-3 font-medium">
                        ₹{s.price.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">
                        {s.description || '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteService(s.id)}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4h6v2" />
                            </svg>
                          </Button>
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

      {/* Custom Form Builder */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Custom Form Builder</CardTitle>
            <CardDescription className="mt-1.5">
              Admin can create custom questions for the client intake form.
            </CardDescription>
          </div>
          <Link href="/dashboard/settings/questions/add">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">+ Add New Question</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {localFormFields.length === 0 ? (
              <div className="text-center p-8 border rounded-md border-dashed text-muted-foreground text-sm">
                No custom questions yet. Click &quot;Add New Question&quot; to create one.
              </div>
            ) : (
              localFormFields.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-white hover:border-blue-200 transition-colors group"
                >
                  <div>
                    <h4 className="font-medium text-sm text-gray-900">{f.label}</h4>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${badgeClass(f.fieldType)}`}
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
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteField(f.id)}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
