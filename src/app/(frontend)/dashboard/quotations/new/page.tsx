import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import CreateQuotationForm from '@/components/create-quotation-form'

export default async function NewQuotationPage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string; leadName?: string }>
}) {
  const { leadId, leadName } = await searchParams
  const payload = await getPayload({ config: configPromise })

  const res = await payload.find({
    collection: 'leads',
    limit: 1000,
    depth: 1,
    overrideAccess: true,
    select: {
      leadId: true,
      contact: true,
      weddingDate: true,
      status: true,
      servicesLookedFor: true,
      weddingCeremonies: true,
      entertainmentOptions: true,
      hospitalityServices: true,
      additionalServices: true,
    },
  })

  const leads = res.docs.map((d: any) => ({
    id: d.id,
    fullName: d.contact?.name || 'Unknown',
    leadId: d.leadId || null,
    weddingDate: d.weddingDate || null,
    status: d.status || null,
    servicesLookedFor: d.servicesLookedFor,
    weddingCeremonies: d.weddingCeremonies,
    entertainmentOptions: d.entertainmentOptions,
    hospitalityServices: d.hospitalityServices,
    additionalServices: d.additionalServices,
  }))

  return (
    <CreateQuotationForm
      leads={leads}
      defaultLeadId={leadId}
      defaultLeadName={leadName}
    />
  )
}
