import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SectionCards } from '@/components/section-cards'
import { SiteHeader } from '@/components/site-header'
import { LeadsTable } from '@/components/leads-table'
import React, { Suspense } from 'react'

export interface Lead {
  id: string | number
  leadId?: string | null
  fullName: string
  email: string
  phone?: string | null
  status: string
  checkInDate?: string | null
  checkOutDate?: string | null
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const search = await searchParams
  const q = typeof search.q === 'string' ? search.q : Array.isArray(search.q) ? search.q[0] : undefined

  const payload = await getPayload({ config: configPromise })

  // Build search filter
  const where: Record<string, any> = q
    ? {
        or: [
          { 'contact.name': { contains: q } },
          { 'contact.email': { contains: q } },
          { leadId: { contains: q } },
        ],
      }
    : {}

  // Get counts and recent leads
  const [allResult, newResult, contactedResult, confirmedResult, recentLeads] = await Promise.all([
    payload.find({ collection: 'leads', limit: 0, overrideAccess: true }),
    payload.find({
      collection: 'leads',
      limit: 0,
      where: { status: { equals: 'new' } },
      overrideAccess: true,
    }),
    payload.find({
      collection: 'leads',
      limit: 0,
      where: { status: { equals: 'contacted' } },
      overrideAccess: true,
    }),
    payload.find({
      collection: 'leads',
      limit: 0,
      where: { status: { equals: 'confirmed' } },
      overrideAccess: true,
    }),
    payload.find({
      collection: 'leads',
      limit: 10,
      sort: '-createdAt',
      overrideAccess: true,
      depth: 1,
      where,
      select: {
        id: true,
        leadId: true,
        contact: true,
        status: true,
        checkInDate: true,
        checkOutDate: true,
        resortCategory: true,
        cuisineType: true,
      },
    }),
  ])

  const totalLeads = allResult?.totalDocs ?? 0
  const opportunityCount = newResult?.totalDocs ?? 0
  const prospectCount = contactedResult?.totalDocs ?? 0
  const wonCount = confirmedResult?.totalDocs ?? 0

  // Map leads for the table, pulling contact info from the relationship
  const leads: Lead[] = (recentLeads?.docs || []).map((d: any) => ({
    id: d.id,
    leadId: d.leadId ?? null,
    fullName: typeof d.contact === 'object' && d.contact ? (d.contact as any).name : 'Unknown',
    email: typeof d.contact === 'object' && d.contact ? (d.contact as any).email : '',
    phone: typeof d.contact === 'object' && d.contact ? (d.contact as any).phone : null,
    status: d.status ?? 'new',
    checkInDate: d.checkInDate ?? null,
    checkOutDate: d.checkOutDate ?? null,
  }))

  const totalDocs = recentLeads?.totalDocs ?? 0

  return (
    <>
      <Suspense fallback={<div className="h-12 border-b bg-white" />}>
        <SiteHeader title="Dashboard" showSearch />
      </Suspense>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards
              totalLeads={totalLeads}
              opportunityCount={opportunityCount}
              prospectCount={prospectCount}
              wonCount={wonCount}
            />
            <div className="px-4 lg:px-6">
              <LeadsTable leads={leads} totalDocs={totalDocs} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
