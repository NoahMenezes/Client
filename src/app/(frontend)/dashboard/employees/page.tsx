'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export interface Employee {
  id: string | number
  name: string
  email: string
  phone?: string | null
  assignedLeads?: number
}

// Replace with real data fetched via API when backend is ready
const MOCK_EMPLOYEES: Employee[] = []

export default function EmployeesPage() {
  const [employees] = useState<Employee[]>(MOCK_EMPLOYEES)
  const [totalDocs] = useState(MOCK_EMPLOYEES.length)
  const [search, setSearch] = useState('')

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-14 items-center border-b px-6 gap-4">
        <h1 className="text-xl font-bold">Employees</h1>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative w-64">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              placeholder="Search by name or email"
              className="w-full rounded-md border bg-background px-3 py-1.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link href="/dashboard/employees/add">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">+ Add Employee</Button>
          </Link>
        </div>
      </header>

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
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
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
