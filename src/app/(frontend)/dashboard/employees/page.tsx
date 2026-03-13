import React, { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/site-header'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { EmployeesClient } from './employees-client'

export default async function EmployeesPage() {
  const payload = await getPayload({ config: configPromise })

  const { docs: employees, totalDocs } = await payload.find({
    collection: 'employees',
    overrideAccess: true,
    limit: 100,
    sort: 'name',
  })

  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<div className="h-12 border-b bg-white" />}>
        <SiteHeader title="Employees">
          <Link href="/dashboard/employees/add">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              + Add Employee
            </Button>
          </Link>
        </SiteHeader>
      </Suspense>

      <EmployeesClient employees={employees} totalDocs={totalDocs} />
    </div>
  )
}
