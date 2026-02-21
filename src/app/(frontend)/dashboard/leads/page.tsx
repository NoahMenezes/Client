import React, { Suspense } from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const statusStyles: Record<string, string> = {
  opportunity: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
  prospect: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  won: 'bg-green-100 text-green-700 hover:bg-green-100',
  lost: 'bg-red-100 text-red-700 hover:bg-red-100',
  'in-progress': 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  'no-response': 'bg-gray-100 text-gray-600 hover:bg-gray-100',
  disqualified: 'bg-red-100 text-red-700 hover:bg-red-100',
  'lost-prospect': 'bg-red-50 text-red-500 hover:bg-red-50',
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

const statusCategories = [
  {
    value: 'opportunity',
    label: 'Opportunity',
    description:
      'Leads currently in processing. Added to both Active Leads and the Calendar for scheduling follow-ups.',
    visibility: 'Shown in Active Leads & Calendar',
    visibilityClass: 'text-green-600',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    icon: '↗',
  },
  {
    value: 'prospect',
    label: 'Prospect',
    description: 'Potential customers being nurtured. Requires follow-up activities.',
    visibility: 'Shown in Active Leads & Calendar',
    visibilityClass: 'text-green-600',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    icon: '⚡',
  },
  {
    value: 'won',
    label: 'Won',
    description:
      'Converted leads. Moved to the Won section. Still visible on calendar to indicate booked dates.',
    visibility: 'Hidden from Active Leads · Visible in Calendar',
    visibilityClass: 'text-blue-600',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    icon: '✓',
  },
  {
    value: 'no-response',
    label: 'No Response',
    description: 'Lead is unresponsive. Automatically moved to Closed Leads.',
    visibility: 'Hidden from Active Leads & Calendar',
    visibilityClass: 'text-gray-400',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
    icon: '✕',
  },
  {
    value: 'disqualified',
    label: 'Disqualified',
    description: 'Lead does not qualify. Removed from pipeline. Requires follow-up.',
    visibility: 'Hidden from Active Leads & Calendar',
    visibilityClass: 'text-gray-400',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
    icon: '✕',
  },
  {
    value: 'lost-prospect',
    label: 'Lost Prospect',
    description: 'Prospect not converted. Stored under closed leads.',
    visibility: 'Hidden from Active Leads & Calendar',
    visibilityClass: 'text-gray-400',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-400',
    icon: '✕',
  },
]

interface Props {
  searchParams: Promise<{ q?: string; status?: string; from?: string; to?: string }>
}

export default async function LeadsPage({ searchParams }: Props) {
  const { q = '', status = '', from = '', to = '' } = await searchParams

  let leads: any[] = []
  let totalDocs = 0

  try {
    const payload = await getPayload({ config: configPromise })

    const where: Record<string, any> = {}

    if (q) {
      where.or = [
        { fullName: { contains: q } },
        { email: { contains: q } },
        { leadId: { contains: q } },
      ]
    }

    if (status) {
      where.status = { equals: status }
    } else {
      // By default only show active statuses
      where.status = { in: ['opportunity', 'prospect', 'in-progress', 'won'] }
    }

    if (from || to) {
      const dateFilter: Record<string, string> = {}
      if (from) dateFilter.greater_than_equal = from
      if (to) dateFilter.less_than_equal = to
      where.checkInDate = dateFilter
    }

    const res = await payload.find({
      collection: 'leads',
      where,
      sort: '-createdAt',
      limit: 50,
      depth: 0,
      overrideAccess: true,
    })

    leads = res.docs.map((d: any) => ({
      id: d.id,
      leadId: d.leadId ?? null,
      fullName: d.fullName ?? '',
      email: d.email ?? '',
      phone: d.phone ?? null,
      status: d.status ?? 'opportunity',
      checkInDate: d.checkInDate ?? null,
      checkOutDate: d.checkOutDate ?? null,
    }))
    totalDocs = res.totalDocs
  } catch (e) {
    console.error('Leads fetch error:', e)
  }

  const isFiltered = q || status || from || to

  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<div className="h-12 border-b bg-white" />}>
        <SiteHeader title="Leads">
          <Link href="/dashboard/leads/add">
            <Button className="bg-[#1a2744] text-white hover:bg-[#243460]" size="sm">
              + Add Lead
            </Button>
          </Link>
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

        {/* Filter Active Leads by Date Range */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">
            Filter Active Leads by Date Range
          </h2>
          <form
            method="get"
            className="flex flex-wrap items-end gap-3 bg-white border rounded-xl p-4 shadow-sm"
          >
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
                <option value="opportunity">Opportunity</option>
                <option value="prospect">Prospect</option>
                <option value="in-progress">In Progress</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
                <option value="no-response">No Response</option>
                <option value="disqualified">Disqualified</option>
                <option value="lost-prospect">Lost Prospect</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Start Date</label>
              <input
                name="from"
                type="date"
                defaultValue={from}
                className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">End Date</label>
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
            {from && to && (
              <p className="text-xs text-gray-400 self-end pb-1">
                Example: {from} → {to}
              </p>
            )}
          </form>
        </section>

        {/* Leads Table */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">
            Active Leads{isFiltered ? ' (Based on Filter)' : ''}
          </h2>
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
                      <th className="px-5 py-3 text-left font-medium">Check-in</th>
                      <th className="px-5 py-3 text-left font-medium">Check-out</th>
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
                          {lead.checkInDate || '—'}
                        </td>
                        <td className="px-5 py-3 text-gray-600 text-xs">
                          {lead.checkOutDate || '—'}
                        </td>
                        <td className="px-5 py-3">
                          <Badge
                            className={`text-xs ${statusStyles[lead.status] || 'bg-gray-100 text-gray-600'}`}
                          >
                            {statusLabels[lead.status] || lead.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          <Link href={`/dashboard/leads/${lead.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-3 text-xs text-blue-600 hover:text-blue-700"
                            >
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-5 py-3 border-t text-xs text-gray-400 flex items-center justify-between">
                  <span>
                    Showing <strong>{leads.length}</strong> of <strong>{totalDocs}</strong> leads
                  </span>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
