import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import EditServiceClient from './EditServiceClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditServicePage({ params }: PageProps) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })

  let service: any
  try {
    service = await payload.findByID({
      collection: 'services',
      id,
      overrideAccess: true,
    })
  } catch {
    notFound()
  }
  if (!service) notFound()

  return <EditServiceClient service={JSON.parse(JSON.stringify(service))} />
}
