'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { IconPencil } from '@tabler/icons-react'
import { deleteEmployee } from '@/app/actions/employees'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

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
  const [currentPage, setCurrentPage] = useState(1)

  const PAGE_LIMIT = 10
  const MAX_PAGES = 50

  const filtered = employees

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No employees yet. Click &quot;+ Add Employee&quot; to create one.
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
        <div className="px-5 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground order-2 sm:order-1">
            Showing <strong>{Math.min(filtered.length, (currentPage - 1) * PAGE_LIMIT + 1)}</strong>
            –<strong>{Math.min(filtered.length, currentPage * PAGE_LIMIT)}</strong> of{' '}
            <strong>{totalDocs}</strong> results
          </span>
          <Pagination className="order-1 sm:order-2 w-auto mx-0">
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage((p) => p - 1)
                    }}
                  />
                </PaginationItem>
              )}

              {Array.from(
                {
                  length: Math.max(1, Math.min(MAX_PAGES, Math.ceil(filtered.length / PAGE_LIMIT))),
                },
                (_, i) => i + 1,
              ).map((p) => {
                const totalPages = Math.min(MAX_PAGES, Math.ceil(filtered.length / PAGE_LIMIT))
                const isFirst = p === 1
                const isLast = p === totalPages
                const isWithinRange = Math.abs(p - currentPage) <= 1

                if (isFirst || isLast || isWithinRange) {
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={p === currentPage}
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(p)
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                }

                if (p === currentPage - 2 || p === currentPage + 2) {
                  return (
                    <PaginationItem key={p}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }

                return null
              })}

              {currentPage < Math.min(MAX_PAGES, Math.ceil(filtered.length / PAGE_LIMIT)) && (
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage((p) => p + 1)
                    }}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </main>
  )
}
