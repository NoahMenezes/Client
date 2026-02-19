import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import CreateQuotationForm from '@/components/create-quotation-form'

interface Props {
  searchParams: Promise<{ leadId?: string; leadName?: string }>
}

export default async function NewQuotationPage({ searchParams }: Props) {
  const { leadId, leadName } = await searchParams

  let leads: Array<{ id: number | string; fullName: string; leadId?: string | null }> = []

  try {
    const payload = await getPayload({ config: configPromise })
    const res = await payload.find({
      collection: 'leads',
      limit: 200,
      sort: '-createdAt',
      overrideAccess: true,
    })
    leads = res.docs.map((l: any) => ({
      id: l.id,
      fullName: l.fullName,
      leadId: l.leadId || null,
    }))
  } catch (e) {
    console.error('Failed to fetch leads:', e)
  }

  return (
    <CreateQuotationForm
      leads={leads}
      defaultLeadId={leadId}
      defaultLeadName={leadName}
    />
  )
}
