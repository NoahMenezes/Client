'use client'

import React from 'react'
import { use } from 'react'
import QuotationViewContent from './quotation-view'

export default function QuotationViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  // When backend is ready, fetch quotation by `id` and pass: <QuotationViewContent quotation={...} />
  return <QuotationViewContent />
}
