'use client'

import React from 'react'
import { use } from 'react'
import EditQuotationPage from './edit-view'

export default function EditQuotationRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  // When the backend is ready, fetch quotation by `id` inside a useEffect
  // and pass it to <EditQuotationPage quotation={...} leads={...} />
  return <EditQuotationPage />
}
