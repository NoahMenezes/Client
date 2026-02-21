'use client'

import React from 'react'
import CreateQuotationForm from '@/components/create-quotation-form'

export default function NewQuotationPage() {
  // When backend is ready, pass leads fetched from the API to <CreateQuotationForm leads={...} />
  return <CreateQuotationForm leads={[]} />
}
