import React, { Suspense } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Badge } from '@/components/ui/badge'
import { notFound } from 'next/navigation'
import { IconPhone, IconMessage, IconCalendar, IconMail } from '@tabler/icons-react'
import LeadProfileTabs from '@/components/lead-profile-tabs'

const statusStyles: Record<string, string> = {
  opportunity: 'bg-orange-100 text-orange-700',
  prospect: 'bg-yellow-100 text-yellow-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  'no-response': 'bg-gray-100 text-gray-600',
  disqualified: 'bg-red-100 text-red-700',
  'lost-prospect': 'bg-red-50 text-red-500',
}
const statusLabels: Record<string, string> = {
  opportunity: 'Opportunity',
  prospect: 'Prospect',
  won: 'Won',
  lost: 'Lost',
  'in-progress': 'In Progress',
  'no-response': 'No Response',
  disqualified: 'Disqualified',
  'lost-prospect': 'Lost Prospect',
}

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function LeadDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { tab = 'info' } = await searchParams
  const payload = await getPayload({ config: configPromise })

  let lead: any
  try {
    lead = await payload.findByID({ collection: 'leads', id, overrideAccess: true, depth: 1 })
  } catch {
    notFound()
  }
  if (!lead) notFound()

  let employees: any[] = []
  try {
    const res = await payload.find({ collection: 'employees', limit: 100, overrideAccess: true })
    employees = res.docs
  } catch {}

  let notes: any[] = []
  try {
    const res = await payload.find({
      collection: 'notes',
      where: { lead: { equals: id } },
      sort: '-createdAt',
      limit: 100,
      overrideAccess: true,
    })
    notes = res.docs.map((n: any) => ({
      id: n.id,
      content: n.content,
      createdBy: n.createdBy || 'Admin',
      pinned: n.pinned || false,
      createdAt: n.createdAt,
    }))
  } catch {}

  let quotations: any[] = []
  try {
    const res = await payload.find({
      collection: 'quotations',
      where: { lead: { equals: id } },
      sort: '-createdAt',
      limit: 100,
      overrideAccess: true,
    })
    quotations = res.docs.map((q: any) => ({
      id: q.id,
      title: q.title,
      grandTotal: q.grandTotal || 0,
      status: q.status || 'draft',
      quotationDate: q.quotationDate || null,
      categories: q.categories || [],
    }))
  } catch {}

  const serializedLead = {
    id: lead.id,
    leadId: lead.leadId || null,
    fullName: lead.fullName || '',
    email: lead.email || '',
    phone: lead.phone || null,
    status: lead.status || 'opportunity',
    checkInDate: lead.checkInDate || null,
    checkOutDate: lead.checkOutDate || null,
    weddingDate: lead.weddingDate || null,
    budget: lead.budget || null,
    coupleName: lead.coupleName || null,
    leadSource: lead.leadSource || null,
    internalNotes: lead.internalNotes || '',
    basicInformation: lead.basicInformation || '',
    hospitalityServices: lead.hospitalityServices || '',
    typesOfServiceRequired: lead.typesOfServiceRequired || '',
    artistsRequirement: lead.artistsRequirement || '',
    googleFormEnquiry: lead.googleFormEnquiry || '',
    firstCallDate: lead.firstCallDate || null,
    proposalSentDate: lead.proposalSentDate || null,
    pocName: lead.pocName || null,
    servicesRequested: lead.servicesRequested || [],
    assignedEmployee:
      typeof lead.assignedEmployee === 'object' && lead.assignedEmployee !== null
        ? { id: lead.assignedEmployee.id, name: lead.assignedEmployee.name }
        : null,
    quotation: lead.quotation || [],
    grandTotal: lead.grandTotal || 0,
  }

  const serializedEmployees = employees.map((e: any) => ({
    id: e.id,
    name: e.name,
    email: e.email,
  }))

  const leadDisplayId = serializedLead.leadId || `PK-${serializedLead.id}`

  return (
    <div className="flex flex-1 flex-col min-h-screen bg-gray-50/50">
      {/* Top bar with search / notification icons */}
      <div className="h-12 border-b bg-white flex items-center justify-end px-6 gap-3">
        <button className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
        <button className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>
      </div>

      {/* Page heading */}
      <div className="px-6 pt-6 pb-0">
        <p className="text-sm text-gray-400 mb-1">
          Lead Profile - {tab === 'notes' ? 'Notes' : tab === 'quotations' ? 'Quotations' : 'Info'}
        </p>
      </div>

      {/* Main card container */}
      <div className="flex-1 px-6 pt-3 pb-6">
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col h-full">
          {/* Card header with lead name & ID */}
          <div className="px-8 pt-6 pb-0">
            <h1 className="text-xl font-bold text-gray-900">
              Lead Details – {serializedLead.fullName}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Lead ID: {leadDisplayId}</p>
          </div>

          {/* Content area: sidebar + tabs */}
          <div className="flex flex-1 min-h-0 mt-4">
            {/* Left sidebar – contact card */}
            <aside className="w-56 shrink-0 border-r flex flex-col items-center py-6 px-4 gap-3">
              {/* Avatar */}
              <div className="h-20 w-20 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-2xl font-bold text-gray-400 overflow-hidden">
                {serializedLead.fullName.charAt(0).toUpperCase()}
              </div>

              <div className="text-center">
                <h2 className="text-base font-bold text-gray-900">{serializedLead.fullName}</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">Lead ID: {leadDisplayId}</p>
              </div>

              {/* Quick action icons */}
              <div className="flex items-center gap-3 mt-1">
                {serializedLead.phone && (
                  <a
                    href={`tel:${serializedLead.phone}`}
                    className="p-2 rounded-full bg-gray-50 border hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <IconPhone className="h-3.5 w-3.5" />
                  </a>
                )}
                <a
                  href={serializedLead.phone ? `sms:${serializedLead.phone}` : '#'}
                  className="p-2 rounded-full bg-gray-50 border hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <IconMessage className="h-3.5 w-3.5" />
                </a>
                <a
                  href="#"
                  className="p-2 rounded-full bg-gray-50 border hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <IconCalendar className="h-3.5 w-3.5" />
                </a>
                <a
                  href={`mailto:${serializedLead.email}`}
                  className="p-2 rounded-full bg-gray-50 border hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <IconMail className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="w-full space-y-3 text-sm mt-3">
                {serializedLead.phone && (
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">Mobile</p>
                    <p className="text-gray-800 font-medium text-sm mt-0.5">
                      {serializedLead.phone}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Email</p>
                  <p className="text-gray-800 font-medium text-sm mt-0.5 break-all">
                    {serializedLead.email}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Lead Status</p>
                  <div className="mt-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-1.5 w-full rounded-full ${
                          serializedLead.status === 'won'
                            ? 'bg-green-400'
                            : serializedLead.status === 'lost' ||
                                serializedLead.status === 'disqualified' ||
                                serializedLead.status === 'lost-prospect'
                              ? 'bg-red-400'
                              : serializedLead.status === 'in-progress' ||
                                  serializedLead.status === 'opportunity'
                                ? 'bg-blue-400'
                                : 'bg-yellow-400'
                        }`}
                      />
                    </div>
                    <p
                      className={`text-xs font-semibold mt-1 ${
                        serializedLead.status === 'won'
                          ? 'text-green-600'
                          : serializedLead.status === 'lost' ||
                              serializedLead.status === 'disqualified' ||
                              serializedLead.status === 'lost-prospect'
                            ? 'text-red-500'
                            : serializedLead.status === 'in-progress' ||
                                serializedLead.status === 'opportunity'
                              ? 'text-blue-600'
                              : 'text-yellow-600'
                      }`}
                    >
                      {statusLabels[serializedLead.status] || serializedLead.status}
                    </p>
                  </div>
                </div>
                {serializedLead.assignedEmployee && (
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">Lead Assigned By</p>
                    <p className="text-gray-800 font-medium text-sm mt-0.5">
                      {serializedLead.assignedEmployee.name}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Lead Referred By</p>
                  <p className="text-gray-800 font-medium text-sm mt-0.5 capitalize">
                    {serializedLead.leadSource
                      ? serializedLead.leadSource.replace(/-/g, ' ')
                      : 'Website Enquiry'}
                  </p>
                </div>
              </div>
            </aside>

            {/* Main content with tabs */}
            <main className="flex-1 overflow-auto flex flex-col min-w-0">
              <LeadProfileTabs
                lead={serializedLead}
                employees={serializedEmployees}
                notes={notes}
                quotations={quotations}
                initialTab={tab}
              />
            </main>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t px-6 py-3 bg-white flex items-center justify-center text-xs text-gray-400">
        © 2025 Perfect Knot CRM. All rights reserved.
      </footer>
    </div>
  )
}
