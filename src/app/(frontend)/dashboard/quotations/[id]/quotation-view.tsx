'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { deleteQuotation } from '@/app/actions/quotations'

// ─── Types ──────────────────────────────────────────────────────────────────

interface LineItem {
  particulars: string
  amount: number
  quantity: number
  total?: number
  remarks?: string
}

interface Category {
  categoryName: string
  items: LineItem[]
}

interface Lead {
  id: string | number
  fullName: string
  email?: string
}

export interface QuotationViewData {
  id: string | number
  title: string
  status?: string
  quotationDate?: string | null
  lead?: Lead | null
  categories?: Category[]
  subTotal?: number
  agencyFees?: number
  agencyFeePercent?: number
  grandTotal?: number
  currency?: string
  notes?: string
}

interface Props {
  quotation?: QuotationViewData
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

const DEFAULT_QUOTATION: QuotationViewData = {
  id: '',
  title: 'Quotation',
  status: 'draft',
  categories: [],
  subTotal: 0,
  agencyFees: 0,
  agencyFeePercent: 12,
  grandTotal: 0,
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function QuotationViewContent({ quotation = DEFAULT_QUOTATION }: Props) {
  const categories = quotation.categories ?? []
  const subTotal = quotation.subTotal ?? 0
  const agencyFees = quotation.agencyFees ?? 0
  const agencyFeePercent = quotation.agencyFeePercent ?? 12
  const grandTotal = quotation.grandTotal ?? 0
  const lead = quotation.lead ?? null
  const currency = quotation.currency || 'INR'
  const currencySymbol = CURRENCIES.find((c) => c.value === currency)?.symbol || '₹'

  const backHref = lead
    ? `/dashboard/leads/${lead.id}?tab=quotations`
    : '/dashboard/quotations'

  const quotationDate = quotation.quotationDate
    ? new Date(quotation.quotationDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null

  let rowCounter = 0

  return (
    <div className="flex flex-1 flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{quotation.title}</h1>
            {quotationDate && <p className="text-xs text-gray-400">{quotationDate}</p>}
          </div>
          {quotation.status && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                STATUS_STYLES[quotation.status] || 'bg-gray-100 text-gray-500'
              }`}
            >
              {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <form
            action={async () => {
              const fd = new FormData()
              fd.set('id', String(quotation.id))
              await deleteQuotation(fd)
            }}
          >
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="gap-1.5 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
              Delete
            </Button>
          </form>
          <Link href={`/dashboard/quotations/${quotation.id}/edit`}>
            <Button size="sm" className="bg-[#1a2744] hover:bg-[#243460] text-white gap-1.5">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Quotation
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Client info */}
          {lead && (
            <div className="bg-white rounded-xl border shadow-sm p-5 mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Client</p>
                  <p className="font-semibold text-gray-400">
                    {lead.fullName}
                  </p>
                  {lead.email && (
                    <p className="text-xs text-gray-500 mt-0.5">{lead.email}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-0.5">Grand Total</p>
                  <p className="text-2xl font-bold text-gray-900">{currencySymbol}{fmt(grandTotal, currency)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quotation table */}
          {(() => {
            const filteredCategories = categories
              .map((cat) => ({
                ...cat,
                items: cat.items.filter((item) => (item.amount || 0) !== 0),
              }))
              .filter((cat) => cat.items.length > 0)

            if (filteredCategories.length === 0) {
              return (
                <div className="bg-white rounded-xl border shadow-sm p-10 text-center text-gray-400">
                  <p>No line items with a set amount in this quotation.</p>
                  <Link href={`/dashboard/quotations/${quotation.id}/edit`} className="mt-3 inline-block">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white mt-3">
                      Edit Quotation
                    </Button>
                  </Link>
                </div>
              )
            }

            return (
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-5 py-3 text-left font-semibold text-gray-600">Sr.</th>
                      <th className="px-5 py-3 text-left font-semibold text-gray-600">Particulars</th>
                      <th className="px-5 py-3 text-right font-semibold text-gray-600 w-32">
                        Cost ({currencySymbol})
                      </th>
                      <th className="px-5 py-3 text-right font-semibold text-gray-600 w-24">Qty</th>
                      <th className="px-5 py-3 text-right font-semibold text-gray-600 w-36">
                        Total ({currencySymbol})
                      </th>
                      <th className="px-5 py-3 text-left font-semibold text-gray-600 w-40">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((cat, ci) => (
                      <React.Fragment key={ci}>
                        <tr className="bg-gray-50 border-b border-t">
                          <td colSpan={6} className="px-5 py-2.5 font-bold text-gray-800 text-sm">
                            {cat.categoryName}
                          </td>
                        </tr>
                        {cat.items.map((item, ii) => {
                          rowCounter += 1
                          const itemTotal = (item.amount || 0) * (item.quantity || 1)
                          return (
                            <tr
                              key={ii}
                              className="border-b last:border-0 hover:bg-gray-50/30 transition-colors"
                            >
                              <td className="px-5 py-3 text-gray-400 text-xs">{rowCounter}</td>
                              <td className="px-5 py-3 text-gray-700">{item.particulars}</td>
                              <td className="px-5 py-3 text-right text-gray-700">
                                {item.amount
                                  ? `${currencySymbol}${fmt(item.amount, currency)}`
                                  : '—'}
                              </td>
                              <td className="px-5 py-3 text-right text-gray-700">
                                {item.quantity ?? 1}
                              </td>
                              <td className="px-5 py-3 text-right font-semibold text-gray-800">
                                {currencySymbol}
                                {fmt(itemTotal, currency)}
                              </td>
                              <td className="px-5 py-3 text-gray-500 text-xs">{item.remarks || '—'}</td>
                            </tr>
                          )
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="border-t bg-gray-50 px-5 py-4">
                  <div className="flex flex-col items-end gap-1.5 text-sm">
                    <div className="flex items-center gap-8 w-72">
                      <span className="text-gray-500 flex-1">Sub-Total</span>
                      <span className="font-semibold text-gray-800 text-right">
                        {currencySymbol}
                        {fmt(subTotal, currency)}
                      </span>
                    </div>
                    <div className="flex items-center gap-8 w-72">
                      <span className="text-gray-500 flex-1">Agency Fees ({agencyFeePercent}%)</span>
                      <span className="font-semibold text-gray-800 text-right">
                        {currencySymbol}
                        {fmt(agencyFees, currency)}
                      </span>
                    </div>
                    <div className="flex items-center gap-8 w-72 pt-2 border-t mt-1">
                      <span className="font-bold text-gray-900 text-base flex-1">Grand Total</span>
                      <span className="font-bold text-gray-900 text-xl text-right">
                        {currencySymbol}
                        {fmt(grandTotal, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Notes */}
          {quotation.notes && (
            <div className="bg-white rounded-xl border shadow-sm p-5 mb-5">
              <h3 className="font-semibold text-gray-700 text-sm mb-2">Internal Notes</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{quotation.notes}</p>
            </div>
          )}

          {/* Actions - Back only, Delete is in the header */}
          <div className="flex justify-start items-center pt-2">
            <Link href={backHref}>
              <Button variant="outline" size="sm">
                ← Back to Quotations
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t px-6 py-3 bg-white text-center text-xs text-gray-400">
        © 2025 Perfect Knot CRM. All rights reserved.
      </footer>
    </div>
  )
}
