'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { IconPlus, IconEye, IconPencil } from '@tabler/icons-react'
import { SiteHeader } from '@/components/site-header'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Quotation {
  id: string | number
  title: string
  lead?: { id: string | number; fullName: string } | null
  grandTotal: number
  status: string
  quotationDate?: string | null
  categories?: Array<{ categoryName: string }>
}
// ─── Status config ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

function fmt(n: number) {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 0 })
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function QuotationsPage() {
  const quotations: Quotation[] = []
  const totalDocs = 0
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = quotations.filter((q) => {
    const matchesSearch =
      !search ||
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      (q.lead?.fullName ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || q.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<div className="h-12 border-b bg-white" />}>
        <SiteHeader title="Quotations">
          <div className="flex items-center gap-2">
            <input
              placeholder="Search quotations or leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-md border bg-background px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <Link href="/dashboard/quotations/new">
            <Button className="bg-blue-600 text-white hover:bg-blue-700" size="sm">
              <IconPlus className="h-4 w-4 mr-1.5" />
              New Quotation
            </Button>
          </Link>
        </SiteHeader>
      </Suspense>

      <main className="flex-1 overflow-auto p-6">
        {filtered.length === 0 ? (
          <div className="rounded-xl border bg-white shadow-sm p-12 text-center">
            <p className="text-gray-400 text-sm mb-4">
              {search || statusFilter
                ? 'No quotations match your filter.'
                : 'No quotations yet.'}
            </p>
            <Link href="/dashboard/quotations/new">
              <Button className="bg-blue-600 text-white hover:bg-blue-700" size="sm">
                Create First Quotation
              </Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing <strong>{filtered.length}</strong> of <strong>{totalDocs}</strong> quotations
              </p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-xs uppercase text-gray-400">
                  <th className="px-5 py-3 text-left font-medium">ID</th>
                  <th className="px-5 py-3 text-left font-medium">Title</th>
                  <th className="px-5 py-3 text-left font-medium">Client</th>
                  <th className="px-5 py-3 text-left font-medium">Amount</th>
                  <th className="px-5 py-3 text-left font-medium">Services</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Date</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q, idx) => {
                  const servicesSummary = (q.categories ?? [])
                    .map((c) => c.categoryName)
                    .slice(0, 3)
                    .join(', ')

                  return (
                    <tr
                      key={q.id}
                      className="border-b last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3 font-medium text-gray-400 text-xs">
                        Q{String(idx + 1).padStart(3, '0')}
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-800 max-w-45">
                        <p className="truncate">{q.title}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {q.lead ? (
                          <Link
                            href={`/dashboard/leads/${q.lead.id}`}
                            className="hover:text-blue-600 hover:underline"
                          >
                            {q.lead.fullName}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-5 py-3 font-semibold text-gray-900">
                        ₹{fmt(q.grandTotal)}
                      </td>
                      <td className="px-5 py-3 text-gray-500 max-w-50">
                        <p className="truncate">{servicesSummary || '—'}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            STATUS_STYLES[q.status] || 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">
                        {q.quotationDate
                          ? new Date(q.quotationDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/dashboard/quotations/${q.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
                              <IconEye className="h-3.5 w-3.5" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/dashboard/quotations/${q.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1 text-blue-600 hover:text-blue-700"
                            >
                              <IconPencil className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
