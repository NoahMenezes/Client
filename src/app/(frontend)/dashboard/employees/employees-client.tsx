'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { IconPencil } from '@tabler/icons-react'
import { deleteEmployee } from '@/app/actions/employees'

interface Employee {
  id: string | number
  name: string
  email: string
  phone?: string | null
  role?: string | null
  department?: string | null
  status?: string | null
}

interface EmployeesClientProps {
  employees: Employee[]
  totalDocs: number
}

export function EmployeesClient({ employees, totalDocs }: EmployeesClientProps) {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const PAGE_LIMIT = 10

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="mb-4">
        <input
          placeholder="Search by name or email"
          className="rounded-md border bg-background px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setCurrentPage(1)
          }}
        />
      </div>

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
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered
                .slice((currentPage - 1) * PAGE_LIMIT, currentPage * PAGE_LIMIT)
                .map((emp) => (
                  <tr key={emp.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">PK-{String(emp.id).padStart(3, '0')}</td>
                    <td className="px-4 py-3 font-semibold">{emp.name}</td>
                    <td className="px-4 py-3">{emp.email}</td>
                    <td className="px-4 py-3">{emp.phone || '—'}</td>
                    <td className="px-4 py-3">{emp.role || '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          emp.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {emp.status ?? 'active'}
                      </span>
                    </td>
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
            Showing <strong>{Math.min(filtered.length, (currentPage - 1) * PAGE_LIMIT + 1)}</strong>
            –<strong>{Math.min(filtered.length, currentPage * PAGE_LIMIT)}</strong> of{' '}
            <strong>{search ? filtered.length : totalDocs}</strong> results
          </span>
          {Math.ceil(filtered.length / PAGE_LIMIT) > 1 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= Math.ceil(filtered.length / PAGE_LIMIT)}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
