import React, { Suspense } from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { deleteLead } from '@/app/actions/leads'
import { getCurrentUser } from '@/app/actions/auth'

const PAGE_LIMIT = 10

const statusStyles: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  contacted: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  proposal_sent: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
  negotiation: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
  confirmed: 'bg-green-100 text-green-700 hover:bg-green-100',
  closed: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  cancelled: 'bg-red-100 text-red-700 hover:bg-red-100',
}

const statusLabels: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  proposal_sent: 'Proposal Sent',
  negotiation: 'Negotiation',
  confirmed: 'Confirmed',
  closed: 'Closed',
  cancelled: 'Cancelled',
}

const statusCategories = [
  {
    value: 'new',
    label: 'New',
    description: 'Fresh leads from Google Form or manual entry.',
    visibility: 'Visible in Pipeline',
    visibilityClass: 'text-blue-600',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    icon: '★',
  },
  {
    value: 'contacted',
    label: 'Contacted',
    description: 'Initial contact made with the lead.',
    visibility: 'Visible in Pipeline',
    visibilityClass: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    icon: '📞',
  },
  {
    value: 'confirmed',
    label: 'Confirmed',
    description: 'Wedding confirmed and booked.',
    visibility: 'Visible in Pipeline & Calendar',
    visibilityClass: 'text-green-600',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    icon: '✓',
  },
]

interface Props {
  searchParams: Promise<{ q?: string; status?: string; from?: string; to?: string; page?: string }>
}

export default async function LeadsPage({ searchParams }: Props) {
  const { q = '', status = '', from = '', to = '', page = '1' } = await searchParams

  const currentPage = Math.max(1, parseInt(page, 10) || 1)

  let leads: any[] = []
  let totalDocs = 0
  let totalPages = 1

  try {
    const payload = await getPayload({ config: configPromise })
    const currentUser = await getCurrentUser()

    const where: Record<string, any> = {}

    if (currentUser) {
      where.createdBy = { equals: currentUser.id }
    }

    if (q) {
      where.or = [
        { 'contact.name': { contains: q } },
        { 'contact.email': { contains: q } },
        { leadId: { contains: q } },
      ]
    }

    if (status) {
      where.status = { equals: status }
    } else {
      where.status = { in: ['new', 'contacted', 'proposal_sent', 'negotiation', 'confirmed'] }
    }

    if (from || to) {
      const dateFilter: Record<string, string> = {}
      if (from) dateFilter.greater_than_equal = from
      if (to) dateFilter.less_than_equal = to
      where.weddingDate = dateFilter
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
      status: d.status ?? 'new',
      checkInDate: d.checkInDate ?? null,
      checkOutDate: d.checkOutDate ?? null,
      weddingDate: d.weddingDate ?? null,
      guestCount: d.guestCount ?? null,
      budget: d.budgetText || (d.budget ? `₹${d.budget.toLocaleString('en-IN')}` : null),
    }))
    totalDocs = res.totalDocs
    totalPages = res.totalPages ?? Math.ceil(totalDocs / PAGE_LIMIT)
  } catch (e) {
    console.error('Leads fetch error:', e)
  }

  const isFiltered = q || status || from || to

  function paginationHref(p: number) {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (status) params.set('status', status)
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    params.set('page', String(p))
    return `/dashboard/leads?${params.toString()}`
  }

  const pageNumbers: number[] = []
  for (let i = 1; i <= totalPages; i++) pageNumbers.push(i)

  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<div className="h-12 border-b bg-white" />}>
        <SiteHeader title="Leads">
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

        {/* Filter */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">
            Filter Active Leads by Date Range
          </h2>
          <form
            method="get"
            className="flex flex-wrap items-end gap-3 bg-white border rounded-xl p-4 shadow-sm"
          >
            <input type="hidden" name="page" value="1" />
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Search</label>
              <input
                name="q"
                defaultValue={q}
                placeholder="Name, email, or Lead ID"
                className="rounded-md border bg-background px-3 py-1.5 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Status</label>
              <select
                name="status"
                defaultValue={status}
                className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none"
              >
                <option value="">All Active</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="proposal_sent">Proposal Sent</option>
                <option value="negotiation">Negotiation</option>
                <option value="confirmed">Confirmed</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Wedding Date From</label>
              <input
                name="from"
                type="date"
                defaultValue={from}
                className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Wedding Date To</label>
              <input
                name="to"
                type="date"
                defaultValue={to}
                className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                Apply Filter
              </Button>
              {isFiltered && (
                <Link href="/dashboard/leads">
                  <Button type="button" variant="outline" size="sm">
                    Clear
                  </Button>
                </Link>
              )}
            </div>
          </form>
        </section>

        {/* Leads Table */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-800">
              Active Leads{isFiltered ? ' (Based on Filter)' : ''}
            </h2>
            <span className="text-xs text-gray-400">
              {totalDocs} total lead{totalDocs !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            {leads.length === 0 ? (
              <div className="p-10 text-center text-gray-400 text-sm">
                {isFiltered ? 'No leads match your filter.' : 'No leads yet. Add your first lead.'}
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
                            <form action={deleteLead}>
                              <input type="hidden" name="id" value={lead.id} />
                              <Button
                                type="submit"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                Delete
                              </Button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="px-5 py-4 border-t flex items-center justify-between gap-4">
                  <span className="text-xs text-gray-400">
                    Showing{' '}
                    <strong>
                      {(currentPage - 1) * PAGE_LIMIT + 1}–
                      {Math.min(currentPage * PAGE_LIMIT, totalDocs)}
                    </strong>{' '}
                    of <strong>{totalDocs}</strong> leads (page {currentPage} of {totalPages})
                  </span>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      {currentPage > 1 && (
                        <Link href={paginationHref(currentPage - 1)}>
                          <button className="h-7 w-7 rounded flex items-center justify-center text-xs text-gray-500 hover:bg-gray-100 border transition-colors">
                            ←
                          </button>
                        </Link>
                      )}

                      {pageNumbers.map((p) => {
                        // Show first, last, and pages near current
                        const show = p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
                        const ellipsisBefore = p === currentPage - 2 && currentPage > 3
                        const ellipsisAfter = p === currentPage + 2 && currentPage < totalPages - 2

                        if (ellipsisBefore || ellipsisAfter) {
                          return (
                            <span key={`ellipsis-${p}`} className="text-xs text-gray-400 px-1">
                              …
                            </span>
                          )
                        }
                        if (!show) return null

                        return (
                          <Link key={p} href={paginationHref(p)}>
                            <button
                              className={`h-7 w-7 rounded flex items-center justify-center text-xs border transition-colors ${
                                p === currentPage
                                  ? 'bg-[#1a2744] text-white border-[#1a2744]'
                                  : 'text-gray-500 hover:bg-gray-100 border-gray-200'
                              }`}
                            >
                              {p}
                            </button>
                          </Link>
                        )
                      })}

                      {currentPage < totalPages && (
                        <Link href={paginationHref(currentPage + 1)}>
                          <button className="h-7 w-7 rounded flex items-center justify-center text-xs text-gray-500 hover:bg-gray-100 border transition-colors">
                            →
                          </button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
