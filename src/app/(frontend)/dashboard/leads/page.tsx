export const dynamic = 'force-dynamic'
import React, { Suspense } from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { DeleteLeadButton } from '@/components/delete-lead-button'

const PAGE_LIMIT = 10

const statusStyles: Record<string, string> = {
  opportunity: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  prospect: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
  won: 'bg-green-100 text-green-700 hover:bg-green-100',
  no_response: 'bg-red-100 text-red-700 hover:bg-red-100',
  disqualified: 'bg-red-100 text-red-700 hover:bg-red-100',
  lost_prospect: 'bg-red-100 text-red-700 hover:bg-red-100',
}

const statusLabels: Record<string, string> = {
  opportunity: 'Opportunity',
  prospect: 'Prospect',
  won: 'Won',
  no_response: 'No Response',
  disqualified: 'Disqualified',
  lost_prospect: 'Lost Prospect',
}

const statusCategories = [
  {
    value: 'opportunity',
    label: 'Opportunity',
    description: 'Active lead opportunity.',
    visibility: 'Visible in Pipeline & Calendar',
    visibilityClass: 'text-blue-600',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    icon: '★',
  },
  {
    value: 'prospect',
    label: 'Prospect',
    description: 'Advanced prospect.',
    visibility: 'Visible in Pipeline & Calendar',
    visibilityClass: 'text-orange-600',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    icon: '📞',
  },
  {
    value: 'won',
    label: 'Won',
    description: 'Wedding confirmed and booked.',
    visibility: 'Visible in Calendar',
    visibilityClass: 'text-green-600',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    icon: '✓',
  },
]

interface Props {
  searchParams: Promise<{ page?: string; section?: string }>
}

export default async function LeadsPage({ searchParams }: Props) {
  const search = await searchParams
  const page = search.page || '1'
  const section = search.section || 'active'

  const currentPage = Math.max(1, parseInt(page, 10) || 1)

  let leads: any[] = []
  let totalDocs = 0
  let totalPages = 1

  try {
    const payload = await getPayload({ config: configPromise })
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      redirect('/login')
    }

    const statusFilter =
      section === 'won' ? ['won']
      : section === 'closed' ? ['no_response', 'disqualified', 'lost_prospect']
      : ['opportunity', 'prospect']

    const where: Record<string, any> = {
      createdBy: { equals: currentUser.id },
      status: { in: statusFilter },
    }

    const res = await payload.find({
      collection: 'leads',
      where,
      sort: '-createdAt',
      limit: PAGE_LIMIT,
      page: currentPage,
      depth: 1,
      overrideAccess: true,
    })

    leads = res.docs.map((d: any) => ({
      id: d.id,
      leadId: d.leadId ?? null,
      fullName: d.contact?.name ?? 'Unknown',
      email: d.contact?.email ?? '',
      phone: d.contact?.phone ?? null,
      status: d.status ?? 'opportunity',
      checkInDate: d.checkInDate ?? null,
      checkOutDate: d.checkOutDate ?? null,
      weddingDate: d.weddingDate ?? null,
      guestCount: d.guestCount ?? null,
      budget: d.budgetText || (d.budget ? `₹${d.budget.toLocaleString('en-IN')}` : null),
    }))
    totalDocs = res.totalDocs
    totalPages = Math.min(50, res.totalPages ?? Math.ceil(totalDocs / PAGE_LIMIT))
  } catch (e) {
    console.error('Leads fetch error:', e)
  }

  function paginationHref(p: number) {
    const params = new URLSearchParams()
    params.set('page', String(p))
    params.set('section', section)
    return `/dashboard/leads?${params.toString()}`
  }

  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<div className="h-12 border-b bg-white" />}>
        <SiteHeader title="Leads" showSearch>
          <div className="flex items-center gap-2">
            <Link
              href="https://docs.google.com/forms/d/e/1FAIpQLSczDIpvtKCfNV1EfmIslmNezmP_Ysw60Lv5uMdbD_TRVx-nqA/viewform?fbzx=-4673714178861004412"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="border-[#1a2744] text-[#1a2744] hover:bg-gray-100"
                size="sm"
              >
                Wedding Enquiry Form
              </Button>
            </Link>
            <Link href="/dashboard/leads/add">
              <Button className="bg-[#1a2744] text-white hover:bg-[#243460]" size="sm">
                + Add Lead
              </Button>
            </Link>
          </div>
        </SiteHeader>
      </Suspense>

      <main className="flex-1 overflow-auto p-6 space-y-8">
        {/* Status Categories */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-4">Lead Status Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statusCategories.map((cat) => (
              <div
                key={cat.value}
                className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-bold ${cat.iconBg} ${cat.iconColor}`}
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">{cat.label}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{cat.description}</p>
                    <p className={`text-[11px] font-medium mt-2 ${cat.visibilityClass}`}>
                      {cat.visibility}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Leads Table */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-gray-100 pb-3">
            <div className="flex gap-6">
              <Link 
                href="/dashboard/leads?section=active" 
                className={`text-base font-semibold pb-3 -mb-3.5 transition-colors ${section === 'active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-700'}`}
              >
                Active Leads
              </Link>
              <Link 
                href="/dashboard/leads?section=won" 
                className={`text-base font-semibold pb-3 -mb-3.5 transition-colors ${section === 'won' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-400 hover:text-gray-700'}`}
              >
                Won Leads
              </Link>
              <Link 
                href="/dashboard/leads?section=closed" 
                className={`text-base font-semibold pb-3 -mb-3.5 transition-colors ${section === 'closed' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-400 hover:text-gray-700'}`}
              >
                Closed Leads
              </Link>
            </div>
            <span className="text-xs text-gray-400">
              {totalDocs} total lead{totalDocs !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            {leads.length === 0 ? (
              <div className="p-10 text-center text-gray-400 text-sm">
                No leads yet. Add your first lead.
              </div>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b text-xs uppercase text-gray-400">
                      <th className="px-5 py-3 text-left font-medium">Lead ID</th>
                      <th className="px-5 py-3 text-left font-medium">Name</th>
                      <th className="px-5 py-3 text-left font-medium">Contact</th>
                      <th className="px-5 py-3 text-left font-medium">Wedding Date</th>
                      <th className="px-5 py-3 text-left font-medium">Guests</th>
                      <th className="px-5 py-3 text-left font-medium">Budget</th>
                      <th className="px-5 py-3 text-left font-medium">Status</th>
                      <th className="px-5 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead, i) => (
                      <tr
                        key={String(lead.id)}
                        className={`border-b last:border-0 hover:bg-gray-50/50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}
                      >
                        <td className="px-5 py-3 font-medium text-gray-500 text-xs">
                          {lead.leadId ? `#${lead.leadId}` : `#${lead.id}`}
                        </td>
                        <td className="px-5 py-3 font-semibold text-gray-800">{lead.fullName}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">
                          <div>{lead.email}</div>
                          {lead.phone && <div>{lead.phone}</div>}
                        </td>
                        <td className="px-5 py-3 text-gray-600 text-xs">
                          {lead.weddingDate
                            ? new Date(lead.weddingDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>
                        <td className="px-5 py-3 text-gray-600 text-xs">
                          {lead.guestCount ?? '—'}
                        </td>
                        <td className="px-5 py-3 text-gray-600 text-xs max-w-30 truncate">
                          {lead.budget ?? '—'}
                        </td>
                        <td className="px-5 py-3">
                          <Badge
                            className={`text-xs ${statusStyles[lead.status] || 'bg-gray-100 text-gray-600'}`}
                          >
                            {statusLabels[lead.status] || lead.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <Link href={`/dashboard/leads/${lead.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-3 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                View
                              </Button>
                            </Link>
                            <Link href={`/dashboard/leads/${lead.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-3 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                              >
                                Edit
                              </Button>
                            </Link>
                            <DeleteLeadButton leadId={lead.id} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="px-5 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-gray-400 order-2 sm:order-1">
                    Showing{' '}
                    <strong>
                      {(currentPage - 1) * PAGE_LIMIT + 1}–
                      {Math.min(currentPage * PAGE_LIMIT, totalDocs)}
                    </strong>{' '}
                    of <strong>{totalDocs}</strong> leads (page {currentPage} of {totalPages})
                  </span>

                  <Pagination className="order-1 sm:order-2 w-auto mx-0">
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious href={paginationHref(currentPage - 1)} />
                        </PaginationItem>
                      )}

                      {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((p) => {
                        const isFirst = p === 1
                        const isLast = p === totalPages
                        const isWithinRange = Math.abs(p - currentPage) <= 1

                        if (isFirst || isLast || isWithinRange) {
                          return (
                            <PaginationItem key={p}>
                              <PaginationLink href={paginationHref(p)} isActive={p === currentPage}>
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        }

                        if (p === currentPage - 2 || p === currentPage + 2) {
                          return (
                            <PaginationItem key={p}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )
                        }

                        return null
                      })}

                      {currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationNext href={paginationHref(currentPage + 1)} />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
