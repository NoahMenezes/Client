import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { IconArrowLeft, IconPencil, IconDownload } from '@tabler/icons-react'
import { deleteQuotation } from '@/app/actions/quotations'

function fmt(n: number) {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 0 })
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function QuotationViewPage({ params }: PageProps) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })

  let quotation: any
  try {
    quotation = await payload.findByID({
      collection: 'quotations',
      id,
      depth: 1,
      overrideAccess: true,
    })
  } catch {
    notFound()
  }
  if (!quotation) notFound()

  const lead =
    typeof quotation.lead === 'object' && quotation.lead !== null ? quotation.lead : null

  const categories: Array<{
    categoryName: string
    items: Array<{
      particulars: string
      amount: number
      quantity: number
      total?: number
      remarks?: string
    }>
  }> = quotation.categories || []

  const subTotal = quotation.subTotal || 0
  const agencyFees = quotation.agencyFees || 0
  const grandTotal = quotation.grandTotal || 0
  const agencyFeePercent = quotation.agencyFeePercent || 12

  const statusStyles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    sent: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }

  const quotationDate = quotation.quotationDate
    ? new Date(quotation.quotationDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null

  // Global row counter
  let rowCounter = 0

  return (
    <div className="flex flex-1 flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <Link
            href={lead ? `/dashboard/leads/${lead.id}?tab=quotations` : '/dashboard/quotations'}
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            <IconArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{quotation.title}</h1>
            {quotationDate && (
              <p className="text-xs text-gray-400">{quotationDate}</p>
            )}
          </div>
          {quotation.status && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                statusStyles[quotation.status] || 'bg-gray-100 text-gray-500'
              }`}
            >
              {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-gray-600"
            onClick={undefined}
          >
            <IconDownload className="h-4 w-4" />
            Download PDF
          </Button>
          <Link href={`/dashboard/quotations/${id}/edit`}>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
            >
              <IconPencil className="h-4 w-4" />
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
                  <Link
                    href={`/dashboard/leads/${lead.id}`}
                    className="font-semibold text-gray-900 hover:text-blue-600 hover:underline"
                  >
                    {lead.fullName}
                  </Link>
                  {lead.email && (
                    <p className="text-xs text-gray-500 mt-0.5">{lead.email}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-0.5">Grand Total</p>
                  <p className="text-2xl font-bold text-gray-900">₹{fmt(grandTotal)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quotation table */}
          {categories.length === 0 ? (
            <div className="bg-white rounded-xl border shadow-sm p-10 text-center text-gray-400">
              <p>No line items added to this quotation yet.</p>
              <Link href={`/dashboard/quotations/${id}/edit`} className="mt-3 inline-block">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white mt-3">
                  <IconPencil className="h-4 w-4 mr-1.5" />
                  Edit Quotation
                </Button>
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 w-12">Sr.<br />No.</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600">Particulars</th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-600 w-32">Cost</th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-600 w-24">Qty</th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-600 w-36">Total</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 w-40">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, ci) => (
                    <React.Fragment key={ci}>
                      {/* Category header row */}
                      <tr className="bg-gray-50 border-b border-t">
                        <td
                          colSpan={6}
                          className="px-5 py-2.5 font-bold text-gray-800 text-sm"
                        >
                          {cat.categoryName}
                        </td>
                      </tr>
                      {/* Line items */}
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
                              {item.amount ? `₹${fmt(item.amount)}` : '—'}
                            </td>
                            <td className="px-5 py-3 text-right text-gray-700">
                              {item.quantity ?? 1}
                            </td>
                            <td className="px-5 py-3 text-right font-semibold text-gray-800">
                              ₹{fmt(itemTotal)}
                            </td>
                            <td className="px-5 py-3 text-gray-500 text-xs">
                              {item.remarks || '—'}
                            </td>
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
                    <span className="font-semibold text-gray-800 text-right">₹{fmt(subTotal)}</span>
                  </div>
                  <div className="flex items-center gap-8 w-72">
                    <span className="text-gray-500 flex-1">
                      Agency Fees ({agencyFeePercent}%)
                    </span>
                    <span className="font-semibold text-gray-800 text-right">
                      ₹{fmt(agencyFees)}
                    </span>
                  </div>
                  <div className="flex items-center gap-8 w-72 pt-2 border-t mt-1">
                    <span className="font-bold text-gray-900 text-base flex-1">Grand Total</span>
                    <span className="font-bold text-gray-900 text-xl text-right">
                      ₹{fmt(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {quotation.notes && (
            <div className="bg-white rounded-xl border shadow-sm p-5 mb-5">
              <h3 className="font-semibold text-gray-700 text-sm mb-2">Internal Notes</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{quotation.notes}</p>
            </div>
          )}

          {/* Danger zone */}
          <div className="flex justify-between items-center pt-2">
            <Link
              href={lead ? `/dashboard/leads/${lead.id}?tab=quotations` : '/dashboard/quotations'}
            >
              <Button variant="outline" size="sm">
                ← Back to Quotations
              </Button>
            </Link>
            <form
              action={async (fd: FormData) => {
                'use server'
                await deleteQuotation(fd)
              }}
            >
              <input type="hidden" name="id" value={String(quotation.id)} />
              {lead && <input type="hidden" name="leadId" value={String(lead.id)} />}
              <Button type="submit" variant="destructive" size="sm">
                Delete Quotation
              </Button>
            </form>
          </div>
        </div>
      </main>

      <footer className="border-t px-6 py-3 bg-white text-center text-xs text-gray-400">
        © 2025 Perfect Knot CRM. All rights reserved.
      </footer>
    </div>
  )
}
