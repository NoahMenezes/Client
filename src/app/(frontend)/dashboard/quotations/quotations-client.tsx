'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { IconPlus, IconEye, IconPencil, IconTrash } from '@tabler/icons-react'
import { SiteHeader } from '@/components/site-header'
import { deleteQuotation } from '@/app/actions/quotations'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Quotation {
  id: string | number
  title: string
  lead?: { id: string | number; fullName: string } | null
  grandTotal: number
  status: string
  currency?: string
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

const CURRENCIES = [
  { label: 'INR (₹)', value: 'INR', symbol: '₹' },
  { label: 'USD ($)', value: 'USD', symbol: '$' },
  { label: 'EUR (€)', value: 'EUR', symbol: '€' },
  { label: 'GBP (£)', value: 'GBP', symbol: '£' },
]

function fmt(n: number, currency: string = 'INR') {
  if (currency === 'INR') {
    return n.toLocaleString('en-IN', { minimumFractionDigits: 0 })
  }
  return n.toLocaleString('en-US', { minimumFractionDigits: 0 })
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function QuotationsClient({
  initialQuotations,
  _totalDocs,
}: {
  initialQuotations: Quotation[]
  _totalDocs: number
}) {
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_LIMIT = 10
  const MAX_PAGES = 50

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = (q: Quotation) => {
    if (!confirm(`Delete "${q.title}"? This cannot be undone.`)) return
    setDeletingId(String(q.id))
    const fd = new FormData()
    fd.set('id', String(q.id))
    if (q.lead) fd.set('leadId', String(q.lead.id))
    startTransition(async () => {
      await deleteQuotation(fd)
      setDeletingId(null)
      router.refresh()
    })
  }

  const filtered = initialQuotations.filter((q) => {
    const matchesStatus = !statusFilter || q.status === statusFilter
    return matchesStatus
  })

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader title="Quotations" showSearch>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
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

      <main className="flex-1 overflow-auto p-6">
        {filtered.length === 0 ? (
          <div className="rounded-xl border bg-white shadow-sm p-12 text-center">
            <p className="text-gray-400 text-sm mb-4">
              {statusFilter ? 'No quotations match your filter.' : 'No quotations found.'}
            </p>
            <Link href="/dashboard/quotations/new">
              <Button className="bg-blue-600 text-white hover:bg-blue-700" size="sm">
                Create First Quotation
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.values(
              filtered.slice((currentPage - 1) * PAGE_LIMIT, currentPage * PAGE_LIMIT).reduce(
                (acc, q) => {
                  const leadId = q.lead?.id || 'unassigned'
                  if (!acc[leadId]) {
                    acc[leadId] = {
                      leadName: q.lead?.fullName || 'Unassigned',
                      leadId: q.lead?.id || null,
                      quotes: [],
                    }
                  }
                  acc[leadId].quotes.push(q)
                  return acc
                },
                {} as Record<
                  string,
                  { leadName: string; leadId: string | number | null; quotes: Quotation[] }
                >,
              ),
            ).map((group, gIdx) => (
              <div key={group.leadId || gIdx} className="relative flex flex-col gap-2">
                {/* Vertical line connecting header and items */}
                <div className="absolute top-8 left-4 bottom-0 w-[2px] bg-gray-200 z-0" />

                {/* Group Header (Lead Name) */}
                <div className="flex items-center gap-3 py-2 z-10 sticky top-0 bg-[#FAFAFA] rounded-md">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center border-[3px] border-white shadow-sm z-10 shrink-0">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-500">
                      Quotations for {group.leadName}
                    </h3>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {group.quotes.length} {group.quotes.length === 1 ? 'QUOTATION' : 'QUOTATIONS'}
                    </span>
                  </div>
                </div>

                {/* Timeline Items */}
                <div className="pl-12 space-y-3 z-10">
                  {group.quotes.map((q) => {
                    const currency = q.currency || 'INR'
                    const currencySymbol =
                      CURRENCIES.find((c) => c.value === currency)?.symbol || '₹'

                    return (
                      <div key={q.id} className="relative group flex items-center">
                        {/* Dot on the line */}
                        <div className="absolute -left-[37px] top-1/2 -translate-y-1/2 h-[11px] w-[11px] rounded-full border-[2.5px] border-white bg-gray-300 group-hover:bg-blue-500 transition-colors z-10 shadow-sm" />

                        {/* Quote Card (Commit style) */}
                        <div
                          onClick={() => router.push(`/dashboard/quotations/${q.id}`)}
                          className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer flex items-center justify-between w-full group/card"
                        >
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-sm font-bold text-gray-800 group-hover/card:text-blue-600 transition-colors truncate">
                                {q.title}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${STATUS_STYLES[q.status] || 'bg-gray-100 text-gray-500'}`}
                              >
                                {q.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                              <span className="flex items-center gap-1 font-mono tracking-tight">
                                <span>Total:</span>
                                <span className="font-bold text-gray-600">
                                  {currencySymbol}
                                  {fmt(q.grandTotal, currency)}
                                </span>
                              </span>
                              <span className="flex items-center gap-1">
                                <IconEye className="h-3.5 w-3.5" />
                                {q.categories?.length || 0} Categories
                              </span>
                              <span className="flex items-center gap-1">
                                <IconPlus className="h-3 w-3" />
                                {q.quotationDate
                                  ? new Date(q.quotationDate).toLocaleDateString('en-GB', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                  : 'No Date'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50 opacity-0 group-hover/card:opacity-100 transition-opacity">
                              <Link
                                href={`/dashboard/quotations/${q.id}`}
                                className="p-2 hover:bg-white text-gray-400 hover:text-blue-600 transition-colors border-r"
                                onClick={(e) => e.stopPropagation()}
                                title="View"
                              >
                                <IconEye className="h-4 w-4" />
                              </Link>
                              <Link
                                href={`/dashboard/quotations/${q.id}`}
                                className="p-2 hover:bg-white text-gray-400 hover:text-green-600 transition-colors border-r"
                                onClick={(e) => e.stopPropagation()}
                                title="Edit"
                              >
                                <IconPencil className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(q)
                                }}
                                disabled={deletingId === String(q.id)}
                                className="p-2 hover:bg-white text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                                title="Delete"
                              >
                                <IconTrash className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="h-8 w-8 rounded-full border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-400 group-hover/card:bg-blue-50 group-hover/card:text-blue-500 transition-colors">
                              <IconPencil className="h-3.5 w-3.5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div className="px-5 py-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
              <span className="text-xs text-gray-400 order-2 sm:order-1">
                Showing{' '}
                <strong>{Math.min(filtered.length, (currentPage - 1) * PAGE_LIMIT + 1)}</strong>–
                <strong>{Math.min(filtered.length, currentPage * PAGE_LIMIT)}</strong> of{' '}
                <strong>{filtered.length}</strong> quotations
              </span>
              <Pagination className="order-1 sm:order-2 w-auto mx-0">
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage((p) => p - 1)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                      />
                    </PaginationItem>
                  )}

                  {Array.from(
                    {
                      length: Math.max(
                        1,
                        Math.min(MAX_PAGES, Math.ceil(filtered.length / PAGE_LIMIT)),
                      ),
                    },
                    (_, i) => i + 1,
                  ).map((p) => {
                    const totalPages = Math.min(MAX_PAGES, Math.ceil(filtered.length / PAGE_LIMIT))
                    const isFirst = p === 1
                    const isLast = p === totalPages
                    const isWithinRange = Math.abs(p - currentPage) <= 1

                    if (isFirst || isLast || isWithinRange) {
                      return (
                        <PaginationItem key={p}>
                          <PaginationLink
                            href="#"
                            isActive={p === currentPage}
                            onClick={(e) => {
                              e.preventDefault()
                              setCurrentPage(p)
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                          >
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

                  {currentPage < Math.min(MAX_PAGES, Math.ceil(filtered.length / PAGE_LIMIT)) && (
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage((p) => p + 1)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
