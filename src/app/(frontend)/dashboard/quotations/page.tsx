import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import QuotationsClient, { type Quotation } from './quotations-client'
import { getCurrentUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function QuotationsPage() {
  const payload = await getPayload({ config: configPromise })
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect('/login')
  }

  const where: Record<string, any> = {
    createdBy: { equals: currentUser.id },
  }

  const res = await payload.find({
    collection: 'quotations',
    limit: 1000,
    depth: 2,
    sort: '-createdAt',
    overrideAccess: true,
    where,
  })

  const serializedQuotations = res.docs.map((q: any) => ({
    id: q.id,
    title: q.title,
    lead: q.lead && typeof q.lead === 'object' 
      ? { 
          id: q.lead.id, 
          fullName: (q.lead.contact && typeof q.lead.contact === 'object' ? q.lead.contact.name : null) || q.lead.leadId || 'Unknown' 
        } 
      : null,
    grandTotal: q.grandTotal || 0,
    status: q.status || 'draft',
    currency: q.currency || 'INR',
    quotationDate: q.quotationDate,
    categories: q.categories || [],
  }))

  return (
    <QuotationsClient 
      initialQuotations={serializedQuotations as Quotation[]} 
      _totalDocs={res.totalDocs} 
    />
  )
}
