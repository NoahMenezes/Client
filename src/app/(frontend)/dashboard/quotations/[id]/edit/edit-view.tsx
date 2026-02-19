'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ─── Types ──────────────────────────────────────────────────────────────────

interface LineItem {
  particulars: string
  amount: number
  quantity: number
  remarks: string
}

interface Category {
  categoryName: string
  items: LineItem[]
}

interface Lead {
  id: string | number
  fullName: string
  leadId?: string | null
}

export interface QuotationEditData {
  id: string | number
  title: string
  lead?: { id: string | number; fullName: string } | null
  leadId?: string
  status?: string
  quotationDate?: string
  agencyFeePercent?: number
  notes?: string
  categories?: Category[]
  subTotal?: number
  agencyFees?: number
  grandTotal?: number
}

interface Props {
  quotation?: QuotationEditData
  leads?: Lead[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 0 })
}

const DEFAULT_QUOTATION: QuotationEditData = {
  id: '',
  title: '',
  leadId: '',
  status: 'draft',
  quotationDate: '',
  agencyFeePercent: 12,
  notes: '',
  categories: [{ categoryName: '', items: [{ particulars: '', amount: 0, quantity: 1, remarks: '' }] }],
  subTotal: 0,
  agencyFees: 0,
  grandTotal: 0,
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function EditQuotationPage({ quotation = DEFAULT_QUOTATION, leads = [] }: Props) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState(quotation.title ?? '')
  const [leadId, setLeadId] = useState(quotation.leadId ?? '')
  const [agencyFeePercent, setAgencyFeePercent] = useState(quotation.agencyFeePercent ?? 12)
  const [quotationDate, setQuotationDate] = useState(
    quotation.quotationDate ? quotation.quotationDate.slice(0, 10) : '',
  )
  const [status, setStatus] = useState(quotation.status ?? 'draft')
  const [notes, setNotes] = useState(quotation.notes ?? '')
  const [categories, setCategories] = useState<Category[]>(
    (quotation.categories?.length ?? 0) > 0
      ? quotation.categories!
      : [{ categoryName: '', items: [{ particulars: '', amount: 0, quantity: 1, remarks: '' }] }],
  )

  // ─── Category helpers ────────────────────────────────────────────────────

  const addCategory = () => {
    setCategories((prev) => [
      ...prev,
      { categoryName: '', items: [{ particulars: '', amount: 0, quantity: 1, remarks: '' }] },
    ])
  }

  const removeCategory = (ci: number) => {
    if (categories.length <= 1) return
    setCategories((prev) => prev.filter((_, i) => i !== ci))
  }

  const updateCategoryName = (ci: number, name: string) => {
    setCategories((prev) => prev.map((c, i) => (i === ci ? { ...c, categoryName: name } : c)))
  }

  // ─── Item helpers ────────────────────────────────────────────────────────

  const addItem = (ci: number) => {
    setCategories((prev) =>
      prev.map((c, i) =>
        i === ci
          ? { ...c, items: [...c.items, { particulars: '', amount: 0, quantity: 1, remarks: '' }] }
          : c,
      ),
    )
  }

  const removeItem = (ci: number, ii: number) => {
    setCategories((prev) =>
      prev.map((c, i) =>
        i === ci ? { ...c, items: c.items.filter((_, j) => j !== ii) } : c,
      ),
    )
  }

  const updateItem = (ci: number, ii: number, field: keyof LineItem, value: string | number) => {
    setCategories((prev) =>
      prev.map((c, i) =>
        i === ci
          ? { ...c, items: c.items.map((item, j) => (j === ii ? { ...item, [field]: value } : item)) }
          : c,
      ),
    )
  }

  // ─── Totals ──────────────────────────────────────────────────────────────

  const subTotal = categories.reduce(
    (sum, cat) =>
      sum + cat.items.reduce((s, item) => s + (item.amount || 0) * (item.quantity || 1), 0),
    0,
  )
  const agencyFees = Math.round(subTotal * agencyFeePercent) / 100
  const grandTotal = subTotal + agencyFees

  // ─── Submit ──────────────────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!title.trim()) {
      setError('Quotation title is required.')
      return
    }
    setIsPending(true)
    // Simulate save — replace with real API call
    setTimeout(() => {
      setIsPending(false)
    }, 800)
  }

  const backHref = quotation.lead
    ? `/dashboard/leads/${quotation.lead.id}?tab=quotations`
    : '/dashboard/quotations'

  return (
    <div className="flex flex-1 flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <Link href={backHref} className="text-sm text-gray-500 hover:text-gray-900">
            ← Back
          </Link>
          <h1 className="text-xl font-bold">
            Edit Quotation{quotation.title ? ` – ${quotation.title}` : ''}
          </h1>
          {isPending && <span className="text-xs text-gray-400 ml-2">Saving...</span>}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/quotations/${quotation.id}`}>
            <Button variant="outline" size="sm" disabled={isPending}>
              View
            </Button>
          </Link>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 max-w-5xl mx-auto w-full">
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">
            {error}
          </div>
        )}

        {/* Meta fields */}
        <div className="bg-white rounded-xl border shadow-sm p-5 mb-5">
          <h2 className="font-semibold text-gray-900 mb-4">Quotation Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-blue-600">
                Quotation Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Wedding Package – Priya & Rohan"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lead" className="text-blue-600">
                Lead / Client
              </Label>
              <select
                id="lead"
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isPending}
              >
                <option value="">Select a lead...</option>
                {leads.map((l) => (
                  <option key={l.id} value={String(l.id)}>
                    {l.fullName}
                    {l.leadId ? ` (${l.leadId})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quotationDate" className="text-blue-600">
                Quotation Date
              </Label>
              <Input
                id="quotationDate"
                type="date"
                value={quotationDate}
                onChange={(e) => setQuotationDate(e.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-blue-600">
                Status
              </Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isPending}
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="agencyFeePercent" className="text-blue-600">
                Agency Fee %
              </Label>
              <Input
                id="agencyFeePercent"
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={agencyFeePercent}
                onChange={(e) => setAgencyFeePercent(Number(e.target.value))}
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-blue-600">
                Internal Notes
              </Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        {/* Categories + items */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-5">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="font-semibold text-gray-900">Line Items</h2>
          </div>

          {categories.map((cat, ci) => (
            <div key={ci} className="border-b last:border-0">
              {/* Category header */}
              <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b">
                <svg
                  className="h-4 w-4 text-gray-300 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="3" y1="15" x2="21" y2="15" />
                </svg>
                <input
                  type="text"
                  value={cat.categoryName}
                  onChange={(e) => updateCategoryName(ci, e.target.value)}
                  placeholder="Category name (e.g. Guest Hospitality)"
                  className="flex-1 bg-transparent font-semibold text-sm text-gray-800 focus:outline-none placeholder:font-normal placeholder:text-gray-400"
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => addItem(ci)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  disabled={isPending}
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add Item
                </button>
                {categories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCategory(ci)}
                    className="text-xs text-red-400 hover:text-red-600"
                    disabled={isPending}
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Items table */}
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase text-gray-400 border-b">
                    <th className="px-5 py-2 text-left font-medium w-8">#</th>
                    <th className="px-5 py-2 text-left font-medium">Particulars</th>
                    <th className="px-5 py-2 text-right font-medium w-36">Amount (₹)</th>
                    <th className="px-5 py-2 text-right font-medium w-28">Quantity</th>
                    <th className="px-5 py-2 text-right font-medium w-36">Total</th>
                    <th className="px-5 py-2 text-left font-medium w-40">Remarks</th>
                    <th className="px-3 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {cat.items.map((item, ii) => {
                    const rowTotal = (item.amount || 0) * (item.quantity || 1)
                    const globalIdx =
                      categories.slice(0, ci).reduce((s, c) => s + c.items.length, 0) + ii + 1

                    return (
                      <tr key={ii} className="hover:bg-gray-50/50">
                        <td className="px-5 py-2.5 text-gray-400 text-xs">{globalIdx}</td>
                        <td className="px-5 py-2.5">
                          <input
                            type="text"
                            value={item.particulars}
                            onChange={(e) => updateItem(ci, ii, 'particulars', e.target.value)}
                            placeholder="Item description"
                            className="w-full bg-transparent text-sm focus:outline-none placeholder:text-gray-300"
                            disabled={isPending}
                          />
                        </td>
                        <td className="px-5 py-2.5">
                          <input
                            type="number"
                            value={item.amount || ''}
                            onChange={(e) =>
                              updateItem(ci, ii, 'amount', Number(e.target.value) || 0)
                            }
                            className="w-full bg-transparent text-sm text-right focus:outline-none"
                            placeholder="0"
                            min={0}
                            disabled={isPending}
                          />
                        </td>
                        <td className="px-5 py-2.5">
                          <input
                            type="number"
                            value={item.quantity || ''}
                            onChange={(e) =>
                              updateItem(ci, ii, 'quantity', Number(e.target.value) || 1)
                            }
                            className="w-full bg-transparent text-sm text-right focus:outline-none"
                            placeholder="1"
                            min={1}
                            disabled={isPending}
                          />
                        </td>
                        <td className="px-5 py-2.5 text-right font-semibold text-gray-700">
                          ₹{fmt(rowTotal)}
                        </td>
                        <td className="px-5 py-2.5">
                          <input
                            type="text"
                            value={item.remarks}
                            onChange={(e) => updateItem(ci, ii, 'remarks', e.target.value)}
                            placeholder="Remarks"
                            className="w-full bg-transparent text-sm focus:outline-none placeholder:text-gray-300"
                            disabled={isPending}
                          />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(ci, ii)}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                            disabled={isPending || cat.items.length <= 1}
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4h6v2" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))}

          {/* Add category button */}
          <div className="px-5 py-3 border-t bg-gray-50/50">
            <button
              type="button"
              onClick={addCategory}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
              disabled={isPending}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Category
            </button>
          </div>
        </div>

        {/* Totals */}
        <div className="bg-white rounded-xl border shadow-sm p-5 mb-6">
          <div className="flex flex-col items-end gap-1.5 text-sm">
            <div className="flex items-center gap-6 w-80">
              <span className="text-gray-500 flex-1">Sub-Total</span>
              <span className="font-semibold text-gray-800 text-right">₹{fmt(subTotal)}</span>
            </div>
            <div className="flex items-center gap-6 w-80">
              <span className="text-gray-500 flex-1">Agency Fees ({agencyFeePercent}%)</span>
              <span className="font-semibold text-gray-800 text-right">₹{fmt(agencyFees)}</span>
            </div>
            <div className="flex items-center gap-6 w-80 pt-2 border-t mt-1">
              <span className="font-bold text-gray-900 text-base flex-1">Grand Total</span>
              <span className="font-bold text-gray-900 text-xl text-right">₹{fmt(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link href={backHref}>
            <Button type="button" variant="outline" disabled={isPending}>
              × Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            {isPending ? 'Saving...' : '✓ Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
