'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { IconPencil } from '@tabler/icons-react'
import { deleteEmployee } from '@/app/actions/employees'
import { SiteHeader } from '@/components/site-header'     

interface Employee {
  id: string | number
  name: string
  email: string
  phone?: string | null
  assignedLeads?: number
}

// Replace with real data fetched via API when backend is ready
const MOCK_EMPLOYEES: Employee[] = []

interface Props {
  employees?: Employee[]
  totalDocs?: number
}

export default function EmployeesPage({ employees = [], totalDocs = 0 }: Props) {
  const [search, setSearch] = useState('')

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<div className="h-12 border-b bg-white" />}>
        <SiteHeader title="Employees">
          <div className="flex items-center gap-2">
            <input
              placeholder="Search by name or email"
              className="rounded-md border bg-background px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link href="/dashboard/employees/add">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              + Add Employee
            </Button>
          </Link>
        </SiteHeader>
      </Suspense>

      <main className="flex-1 overflow-auto p-6">
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              {search
                ? 'No employees match your search.'
                : 'No employees yet. Click "+ Add Employee" to create one.'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">Employee ID</th>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Phone Number</th>
                  <th className="px-4 py-3 text-left font-medium">Assigned Leads</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr key={emp.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">
                      PK-{String(emp.id).padStart(3, '0')}
                    </td>
                    <td className="px-4 py-3 font-semibold">{emp.name}</td>
                    <td className="px-4 py-3">{emp.email}</td>
                    <td className="px-4 py-3">{emp.phone || '—'}</td>
                    <td className="px-4 py-3">{emp.assignedLeads ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/employees/${emp.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700"
                          >
                            <IconPencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <form action={deleteEmployee}>
                          <input type="hidden" name="id" value={emp.id} />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
            <span>
              Showing <strong>{filtered.length}</strong> of <strong>{totalDocs}</strong> results
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}
