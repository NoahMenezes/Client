import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'
import {
  IconPhone,
  IconMessage,
  IconCalendar,
  IconMail,
  IconSearch,
  IconBell,
} from '@tabler/icons-react'
import LeadProfileTabs from '@/components/lead-profile-tabs'

const statusStyles: Record<string, string> = {
  opportunity: 'bg-orange-100 text-orange-700',
  prospect: 'bg-yellow-100 text-yellow-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
  'in-progress': 'bg-blue-100 text-blue-700',
}
const statusLabels: Record<string, string> = {
  opportunity: 'Opportunity',
  prospect: 'Prospect',
  won: 'Won',
  lost: 'Lost',
  'in-progress': 'In Progress',
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
    internalNotes: lead.internalNotes || '',
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

  return (
    <div className="flex flex-1 flex-col min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="flex items-center justify-end px-6 py-3 gap-3 border-b bg-white">
        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
          <IconSearch className="h-4 w-4" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
          <IconBell className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 gap-0">
        {/* Left sidebar – contact card */}
        <aside className="w-64 shrink-0 border-r bg-white flex flex-col items-center py-8 px-5 gap-4">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500 overflow-hidden">
            {serializedLead.fullName.charAt(0).toUpperCase()}
          </div>

          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-900">{serializedLead.fullName}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Lead ID: {serializedLead.leadId || `PK-${serializedLead.id}`}
            </p>
          </div>

          {/* Quick action icons */}
          <div className="flex items-center gap-4 mt-1">
            {serializedLead.phone && (
              <a
                href={`tel:${serializedLead.phone}`}
                className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <IconPhone className="h-4 w-4" />
              </a>
            )}
            <a
              href={`sms:${serializedLead.phone}`}
              className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <IconMessage className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <IconCalendar className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${serializedLead.email}`}
              className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <IconMail className="h-4 w-4" />
            </a>
          </div>

          <div className="w-full space-y-3 text-sm mt-2">
            {serializedLead.phone && (
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Mobile</p>
                <p className="text-gray-800 font-medium mt-0.5">{serializedLead.phone}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Email</p>
              <p className="text-gray-800 font-medium mt-0.5 break-all">{serializedLead.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                Lead Status
              </p>
              <div className="mt-1">
                <Badge className={`text-xs ${statusStyles[serializedLead.status] || ''}`}>
                  {statusLabels[serializedLead.status] || serializedLead.status}
                </Badge>
              </div>
            </div>
            {serializedLead.assignedEmployee && (
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  Lead Assigned By
                </p>
                <p className="text-gray-800 font-medium mt-0.5">
                  {serializedLead.assignedEmployee.name}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                Lead Referred By
              </p>
              <p className="text-gray-800 font-medium mt-0.5">
                {serializedLead.servicesRequested.length > 0
                  ? 'Services Enquiry'
                  : 'Website Enquiry'}
              </p>
            </div>
          </div>
        </aside>

        {/* Main content with tabs */}
        <main className="flex-1 overflow-auto">
          <LeadProfileTabs
            lead={serializedLead}
            employees={serializedEmployees}
            notes={notes}
            quotations={quotations}
            initialTab={tab}
          />
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t px-6 py-3 bg-white flex items-center justify-center text-xs text-gray-400">
        © 2025 Perfect Knot CRM. All rights reserved.
      </footer>
    </div>
  )
}
