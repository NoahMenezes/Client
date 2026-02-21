import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import QuotationViewContent from './quotation-view'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function QuotationViewPage({ params }: PageProps) {
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

  // Ensure the lead is properly passed to the client component
  // Payload returns objects for related fields if depth > 0
  
  return <QuotationViewContent quotation={quotation as any} />
}
