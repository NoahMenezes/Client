'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IconSearch } from '@tabler/icons-react'

type LeadStatus = 'Opportunity' | 'Prospect' | 'Won' | 'Lost' | 'In Progress'

interface Lead {
  id: string
  clientName: string
  contact: string
  checkIn: string
  checkOut: string
  status: LeadStatus
}

const SAMPLE_LEADS: Lead[] = [
  {
    id: '#PK1024',
    clientName: 'Eleanor Vance',
    contact: 'eleanor.v@email.com\n(555) 123-4567',
    checkIn: '2024-08-15',
    checkOut: '2024-08-18',
    status: 'Opportunity',
  },
  {
    id: '#PK1023',
    clientName: 'Marcus Thorne',
    contact: 'marcus.t@email.com\n(555) 987-6543',
    checkIn: '2024-09-20',
    checkOut: '2024-09-22',
    status: 'Prospect',
  },
  {
    id: '#PK1022',
    clientName: 'Isabelle Croft',
    contact: 'isabelle.c@email.com\n(555) 234-5678',
    checkIn: '2024-07-10',
    checkOut: '2024-07-12',
    status: 'Won',
  },
]

const statusStyles: Record<LeadStatus, string> = {
  Opportunity: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
  Prospect: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  Won: 'bg-green-100 text-green-700 hover:bg-green-100',
  Lost: 'bg-red-100 text-red-700 hover:bg-red-100',
  'In Progress': 'bg-blue-100 text-blue-700 hover:bg-blue-100',
}

export function DashboardContent() {
  const [search, setSearch] = useState('')

  const filtered = SAMPLE_LEADS.filter(
    (l) =>
      l.clientName.toLowerCase().includes(search.toLowerCase()) ||
      l.id.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex flex-1 flex-col">
      {/* Top bar */}
      <header className="flex h-14 items-center justify-between border-b px-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="relative w-64">
          <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search Leads"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Leads', value: '1,204' },
            { label: 'Active (Opportunity)', value: '350' },
            { label: 'Advanced (Prospect)', value: '120' },
            { label: 'Converted (Won)', value: '734' },
          ].map((card) => (
            <div key={card.label} className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="mt-1 text-3xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Leads Table */}
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-base">Recent Leads</h2>
          </div>
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
                  <tr key={lead.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 font-medium">{lead.id}</td>
                    <td className="px-4 py-3">{lead.clientName}</td>
                    <td className="px-4 py-3 whitespace-pre-line text-xs">{lead.contact}</td>
                    <td className="px-4 py-3">{lead.checkIn}</td>
                    <td className="px-4 py-3">{lead.checkOut}</td>
                    <td className="px-4 py-3">
                      <Badge className={statusStyles[lead.status]}>{lead.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/leads/${lead.id.replace('#', '')}`}>
                          <Button variant="ghost" size="sm" className="h-7 px-3 text-xs">
                            View
                          </Button>
                        </Link>
                        <Button size="sm" className="h-7 px-3 text-xs bg-[#1a2744] text-white hover:bg-[#243460]">
                          Assign
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
            <span>Showing 1-3 of 100</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
