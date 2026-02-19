import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import EditEmployeeClient from '@/components/edit-employee-form'

interface PageProps { params: Promise<{ id: string }> }

export default async function EditEmployeePage({ params }: PageProps) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })
  let employee: any
  try { employee = await payload.findByID({ collection: 'employees', id, overrideAccess: true }) } catch { notFound() }
  if (!employee) notFound()

  return <EditEmployeeClient employee={JSON.parse(JSON.stringify(employee))} />
}
