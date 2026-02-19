'use client'

import React from 'react'
import { use } from 'react'
import LeadDetailContent from './lead-detail'

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  // When backend is ready, fetch lead by `id` and pass: <LeadDetailContent lead={...} />
  return <LeadDetailContent />
}
