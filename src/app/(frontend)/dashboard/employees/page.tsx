import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IconPencil, IconSearch } from '@tabler/icons-react'
import { deleteEmployee } from '@/app/actions/employees'

export default async function EmployeesPage() {
  let employees: any[] = []
  let totalDocs = 0

  try {
    const payload = await getPayload({ config: configPromise })
    const res = await payload.find({
      collection: 'employees',
      limit: 50,
      sort: '-createdAt',
      overrideAccess: true,
    })
    employees = res.docs
    totalDocs = res.totalDocs
  } catch (e) {
    console.error('Failed to fetch employees:', e)
  }

  // Get assigned lead counts for each employee
  const assignedCounts: Record<string, number> = {}
  try {
    const payload = await getPayload({ config: configPromise })
    for (const emp of employees) {
      const count = await payload.count({
        collection: 'leads',
        where: { assignedEmployee: { equals: emp.id } },
        overrideAccess: true,
      })
      assignedCounts[String(emp.id)] = count.totalDocs
    }
  } catch {}

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-14 items-center border-b px-6 gap-4">
        <h1 className="text-xl font-bold">Employees</h1>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative w-64">
            <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name or email" className="pl-9" />
          </div>
          <Link href="/dashboard/employees/add">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">+ Add Employee</Button>
          </Link>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-6">
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          {employees.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
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
                  <th className="px-4 py-3 text-left font-medium">Assigned Leads</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">PK-{String(emp.id).padStart(3, '0')}</td>
                    <td className="px-4 py-3 font-semibold">{emp.name}</td>
                    <td className="px-4 py-3">{emp.email}</td>
                    <td className="px-4 py-3">{emp.phone || '—'}</td>
                    <td className="px-4 py-3">{assignedCounts[String(emp.id)] || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/employees/${emp.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700"
                          >
                            <IconPencil className="size-4" />
                          </Button>
                        </Link>
                        <form action={deleteEmployee}>
                          <input type="hidden" name="id" value={String(emp.id)} />
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
              Showing <strong>{employees.length}</strong> of <strong>{totalDocs}</strong> results
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}
