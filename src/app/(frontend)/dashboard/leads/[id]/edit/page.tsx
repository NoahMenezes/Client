import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import EditLeadClient from '@/components/edit-lead-form'

interface PageProps { params: Promise<{ id: string }> }

export default async function EditLeadPage({ params }: PageProps) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })
  let lead: any
  try { lead = await payload.findByID({ collection: 'leads', id, overrideAccess: true }) } catch { notFound() }
  if (!lead) notFound()

  return <EditLeadClient lead={JSON.parse(JSON.stringify(lead))} />
}
