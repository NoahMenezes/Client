import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import QuotationsClient, { type Quotation } from './quotations-client'
import { getCurrentUser } from '@/app/actions/auth'

export const dynamic = 'force-dynamic'

export default async function QuotationsPage() {
  const payload = await getPayload({ config: configPromise })
  const currentUser = await getCurrentUser()

  const where: Record<string, any> = {}
  if (currentUser) {
    where.createdBy = { equals: currentUser.id }
  }

  const res = await payload.find({
    collection: 'quotations',
    limit: 1000,
    depth: 1,
    sort: '-createdAt',
    overrideAccess: true,
    where,
  })

  const serializedQuotations = res.docs.map((q: any) => ({
    id: q.id,
    title: q.title,
    lead: q.lead && typeof q.lead === 'object' 
      ? { id: q.lead.id, fullName: q.lead.contact?.name || 'Unknown' } 
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
      totalDocs={res.totalDocs} 
    />
  )
}
