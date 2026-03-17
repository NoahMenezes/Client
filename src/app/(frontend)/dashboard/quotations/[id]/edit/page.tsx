import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import EditQuotationPage from './edit-view'

export default async function EditQuotationRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })

  let quotation: any
  try {
    quotation = await payload.findByID({
      collection: 'quotations',
      id,
      depth: 1,
      overrideAccess: true,
    })
  } catch {
    notFound()
  }

  if (!quotation) notFound()

  // Fetch leads for the dropdown
  const leadsRes = await payload.find({
    collection: 'leads',
    limit: 1000,
    depth: 1,
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
    overrideAccess: true,
  })

  const leads = leadsRes.docs.map((d: any) => ({
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

  const serializedQuotation = {
    id: quotation.id,
    title: quotation.title,
    leadId: typeof quotation.lead === 'object' ? quotation.lead.id : quotation.lead,
    lead:
      typeof quotation.lead === 'object'
        ? { id: quotation.lead.id, fullName: quotation.lead.contact?.name || 'Unknown' }
        : null,
    status: quotation.status,
    quotationDate: quotation.quotationDate,
    agencyFeePercent: quotation.agencyFeePercent,
    notes: quotation.notes,
    currency: quotation.currency || 'INR',
    categories: quotation.categories,
    subTotal: quotation.subTotal,
    agencyFees: quotation.agencyFees,
    grandTotal: quotation.grandTotal,
  }

  return <EditQuotationPage quotation={serializedQuotation} leads={leads} />
}
