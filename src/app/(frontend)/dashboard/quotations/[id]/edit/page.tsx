import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import EditQuotationCategoryForm from '@/components/edit-quotation-category-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditQuotationPage({ params }: PageProps) {
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

  let leads: Array<{ id: number | string; fullName: string; leadId?: string | null }> = []
  try {
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

  const serialized = {
    id: quotation.id,
    title: quotation.title || '',
    lead:
      typeof quotation.lead === 'object' && quotation.lead !== null
        ? { id: quotation.lead.id, fullName: quotation.lead.fullName }
        : null,
    leadId:
      typeof quotation.lead === 'object' && quotation.lead !== null
        ? String(quotation.lead.id)
        : typeof quotation.lead === 'number' || typeof quotation.lead === 'string'
          ? String(quotation.lead)
          : '',
    status: quotation.status || 'draft',
    quotationDate: quotation.quotationDate || '',
    agencyFeePercent: quotation.agencyFeePercent ?? 12,
    notes: quotation.notes || '',
    categories: (quotation.categories || []).map((cat: any) => ({
      categoryName: cat.categoryName || '',
      items: (cat.items || []).map((item: any) => ({
        particulars: item.particulars || '',
        amount: item.amount || 0,
        quantity: item.quantity || 1,
        remarks: item.remarks || '',
      })),
    })),
    subTotal: quotation.subTotal || 0,
    agencyFees: quotation.agencyFees || 0,
    grandTotal: quotation.grandTotal || 0,
  }

  return <EditQuotationCategoryForm quotation={serialized} leads={leads} />
}
