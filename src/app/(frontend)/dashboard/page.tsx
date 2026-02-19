'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// ─── Types ──────────────────────────────────────────────────────────────────

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

// ─── Status config ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  opportunity: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
  prospect: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  won: 'bg-green-100 text-green-700 hover:bg-green-100',
  lost: 'bg-red-100 text-red-700 hover:bg-red-100',
  'in-progress': 'bg-blue-100 text-blue-700 hover:bg-blue-100',
}

const STATUS_LABELS: Record<string, string> = {
  opportunity: 'Opportunity',
  prospect: 'Prospect',
  won: 'Won',
  lost: 'Lost',
  'in-progress': 'In Progress',
}

// ─── Page (App Router compatible, no custom props) ───────────────────────────

export default function DashboardPage() {
  // When backend is ready, fetch this data in a useEffect and update these states
  const [leads] = useState<Lead[]>([])
  const [totalLeads] = useState(0)
  const [opportunityCount] = useState(0)
  const [prospectCount] = useState(0)
  const [wonCount] = useState(0)
  const [search, setSearch] = useState('')

  const filtered = leads.filter(
    (l) =>
      l.fullName.toLowerCase().includes(search.toLowerCase()) ||
      String(l.leadId ?? l.id)
        .toLowerCase()
        .includes(search.toLowerCase()),
  )

  const stats = [
    { label: 'Total Leads', value: totalLeads },
    { label: 'Active (Opportunity)', value: opportunityCount },
    { label: 'Advanced (Prospect)', value: prospectCount },
    { label: 'Converted (Won)', value: wonCount },
  ]

  return (
    <>
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 lg:px-6">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="ml-auto relative w-64">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            placeholder="Search Leads"
            className="w-full rounded-md border bg-background px-3 py-1.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 py-4 px-4 md:gap-6 md:py-6 lg:px-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="@container/card">
              <CardHeader className="pb-4">
                <CardDescription>{s.label}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {s.value.toLocaleString()}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Recent Leads Table */}
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="font-semibold text-base">Recent Leads</h2>
            <Link href="/dashboard/leads/add">
              <Button size="sm" className="bg-[#1a2744] text-white hover:bg-[#243460]">
                + Add Lead
              </Button>
            </Link>
          </div>

          {filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              {search
                ? 'No leads match your search.'
                : 'No leads yet. Click "+ Add Lead" to create your first lead.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#1a2744] text-white text-xs uppercase">
                    <th className="px-4 py-3 text-left font-medium">Lead ID</th>
                    <th className="px-4 py-3 text-left font-medium">Client Name</th>
                    <th className="px-4 py-3 text-left font-medium">Contact</th>
                    <th className="px-4 py-3 text-left font-medium">Check-In</th>
                    <th className="px-4 py-3 text-left font-medium">Check-Out</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead, i) => (
                    <tr key={String(lead.id)} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-medium">
                        {lead.leadId ? `#${lead.leadId}` : `#${lead.id}`}
                      </td>
                      <td className="px-4 py-3">{lead.fullName}</td>
                      <td className="px-4 py-3 text-xs">
                        {lead.email}
                        {lead.phone && (
                          <>
                            <br />
                            {lead.phone}
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3">{lead.checkInDate || '—'}</td>
                      <td className="px-4 py-3">{lead.checkOutDate || '—'}</td>
                      <td className="px-4 py-3">
                        <Badge className={STATUS_STYLES[lead.status] || ''}>
                          {STATUS_LABELS[lead.status] || lead.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/leads/${lead.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 px-3 text-xs">
                              View
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
            <span>
              Showing <strong>{filtered.length}</strong> of <strong>{totalLeads}</strong>
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
