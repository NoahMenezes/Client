import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound, redirect } from 'next/navigation'
import QuotationViewContent from './quotation-view'
import { getCurrentUser } from '@/app/actions/auth'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function QuotationViewPage({ params }: PageProps) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/login')
  }

  let quotation: any
  try {
    quotation = await payload.findByID({
      collection: 'quotations',
      id,
      depth: 2,
      overrideAccess: true,
    })

    if (quotation && quotation.lead && typeof quotation.lead === 'object') {
      const l = quotation.lead as any
      const contactName = (l.contact && typeof l.contact === 'object') ? l.contact.name : null
      l.fullName = contactName || l.fullName || l.leadId || 'Unknown'
      l.email = (l.contact && typeof l.contact === 'object' ? l.contact.email : l.email) || ''
    }
  } catch {
    notFound()
  }

  if (!quotation) notFound()

  // Ownership check – ensure the quotation belongs to the current user
  const qCreatedBy = typeof quotation.createdBy === 'object' ? quotation.createdBy?.id : quotation.createdBy
  if (currentUser.role !== 'admin' && String(qCreatedBy) !== String(currentUser.id)) {
    notFound()
  }

  return <QuotationViewContent quotation={quotation as any} />
}
