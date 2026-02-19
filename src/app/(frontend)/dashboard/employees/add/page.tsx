import { getPayload } from 'payload'
import configPromise from '@payload-config'
import AddEmployeeForm from '@/components/add-employee-form'

export default async function AddEmployeePage() {
  const payload = await getPayload({ config: configPromise })
  const leads = await payload.find({ collection: 'leads', limit: 100, sort: '-createdAt', overrideAccess: true })
  
  return <AddEmployeeForm leads={leads.docs.map((l: any) => ({ id: l.id, fullName: l.fullName, leadId: l.leadId }))} />
}
