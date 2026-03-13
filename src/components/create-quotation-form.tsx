'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'

import { createQuotation } from '@/app/actions/quotations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// Inline SVG icons
const IconGripVertical = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="9" y1="4" x2="9" y2="20"/><line x1="15" y1="4" x2="15" y2="20"/></svg>
)
const IconPlus = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
)
const IconTrash = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
)

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
  id: number | string
  fullName: string
  leadId?: string | null
  weddingDate?: string | null
  status?: string | null
}

interface Props {
  leads: Lead[]
  defaultLeadId?: string
  defaultLeadName?: string
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    categoryName: 'Guest Hospitality',
    items: [{ particulars: '', amount: 0, quantity: 1, remarks: '' }],
  },
]

const CURRENCIES = [
  { label: 'INR (₹)', value: 'INR', symbol: '₹' },
  { label: 'USD ($)', value: 'USD', symbol: '$' },
  { label: 'EUR (€)', value: 'EUR', symbol: '€' },
  { label: 'GBP (£)', value: 'GBP', symbol: '£' },
]

export default function CreateQuotationForm({ leads, defaultLeadId, defaultLeadName }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [title, setTitle] = useState(defaultLeadName ? `Wedding Package – ${defaultLeadName}` : '')
  const [leadId, setLeadId] = useState(defaultLeadId || '')
  const [leadSearch, setLeadSearch] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [agencyFeePercent, setAgencyFeePercent] = useState(12)
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0])
  const [status, setStatus] = useState<'draft' | 'sent' | 'approved' | 'rejected'>('draft')
  const [notes, setNotes] = useState('')
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)

  const currencySymbol = CURRENCIES.find((c) => c.value === currency)?.symbol || '₹'

  // Filter leads based on search
  const filteredLeads = leads.filter((l) => {
    const search = leadSearch.toLowerCase()
    return (
      l.fullName.toLowerCase().includes(search) ||
      (l.leadId && l.leadId.toLowerCase().includes(search))
    )
  })

  // ─── Category helpers ───────────────────────────────────────────────────────
  const addCategory = () => {
    setCategories((prev) => [
      ...prev,
      {
        categoryName: '',
        items: [{ particulars: '', amount: 0, quantity: 1, remarks: '' }],
      },
    ])
  }

  const removeCategory = (ci: number) => {
    setCategories((prev) => prev.filter((_, i) => i !== ci))
  }

  const updateCategoryName = (ci: number, name: string) => {
    setCategories((prev) => prev.map((c, i) => (i === ci ? { ...c, categoryName: name } : c)))
  }

  // ─── Item helpers ────────────────────────────────────────────────────────────
  const addItem = (ci: number) => {
    setCategories((prev) =>
      prev.map((c, i) =>
        i === ci
          ? {
              ...c,
              items: [...c.items, { particulars: '', amount: 0, quantity: 1, remarks: '' }],
            }
          : c,
      ),
    )
  }

  const removeItem = (ci: number, ii: number) => {
    setCategories((prev) =>
      prev.map((c, i) => (i === ci ? { ...c, items: c.items.filter((_, j) => j !== ii) } : c)),
    )
  }

  const updateItem = (ci: number, ii: number, field: keyof LineItem, value: string | number) => {
    setCategories((prev) =>
      prev.map((c, i) =>
        i === ci
          ? {
              ...c,
              items: c.items.map((item, j) => (j === ii ? { ...item, [field]: value } : item)),
            }
          : c,
      ),
    )
  }

  // ─── Totals ──────────────────────────────────────────────────────────────────
  const subTotal = categories.reduce(
    (sum, cat) =>
      sum + cat.items.reduce((s, item) => s + (item.amount || 0) * (item.quantity || 1), 0),
    0,
  )
  const agencyFees = Math.round(subTotal * agencyFeePercent) / 100
  const grandTotal = subTotal + agencyFees

  function fmt(n: number) {
    if (currency === 'INR') {
      return n.toLocaleString('en-IN', { minimumFractionDigits: 0 })
    }
    return n.toLocaleString('en-US', { minimumFractionDigits: 0 })
  }

  // ─── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Quotation title is required.')
      return
    }
    if (!leadId) {
      setError('Please select a lead.')
      return
    }

    const fd = new FormData()
    fd.set('title', title.trim())
    fd.set('leadId', leadId)
    fd.set('currency', currency)
    fd.set('agencyFeePercent', String(agencyFeePercent))
    if (quotationDate) fd.set('quotationDate', quotationDate)
    fd.set('status', status)
    if (notes.trim()) fd.set('notes', notes.trim())
    fd.set('categories', JSON.stringify(categories))

    startTransition(async () => {
      const res = await createQuotation(null, fd)
      if (res && !res.success) setError(res.message)
    })
  }

  const backHref = leadId ? `/dashboard/leads/${leadId}?tab=quotations` : '/dashboard/quotations'

  return (
    <div className="flex flex-1 flex-col min-h-screen bg-gray-50/50">
      <header className="flex h-14 items-center border-b px-6 gap-3 bg-white sticky top-0 z-10">
        <Link href={backHref} className="p-2 -ml-2 rounded-md text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-lg font-bold text-gray-900 px-2">Create New Quotation</h1>
        {isPending && (
          <div className="flex items-center gap-2 text-xs text-blue-600 font-medium ml-2 bg-blue-50 px-3 py-1 rounded-full animate-pulse">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            Saving changes...
          </div>
        )}
      </header>

      <form onSubmit={handleSubmit} className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200 flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* ─── Meta fields ─── */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50/50">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Basic Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-semibold text-gray-500 uppercase">
                  Quotation Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Premium Wedding Package"
                  required
                  disabled={isPending}
                  className="rounded-lg border-gray-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lead-search" className="text-xs font-semibold text-gray-500 uppercase">
                  Select Lead / Client <span className="text-red-500">*</span>
                </Label>
                <div className="relative group">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="lead-search"
                        value={leadSearch}
                        onChange={(e) => {
                          setLeadSearch(e.target.value)
                          // If search matches a lead exactly, or user is typing, we might want to reset leadId 
                          // but for simplicity, we just filter the dropdown
                        }}
                        placeholder="Search by name or ID..."
                        className="rounded-lg border-gray-200 pl-8"
                        disabled={isPending}
                      />
                      <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <select
                      id="lead"
                      value={leadId}
                      onChange={(e) => {
                        setLeadId(e.target.value)
                        const l = leads.find(l => String(l.id) === e.target.value)
                        if (l) {
                          setLeadSearch(l.fullName)
                          if (!title) setTitle(`Wedding Package – ${l.fullName}`)
                        }
                      }}
                      className="w-1/2 rounded-lg border border-gray-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      required
                      disabled={isPending}
                    >
                      <option value="">Choose Lead...</option>
                      {filteredLeads.map((l) => (
                        <option key={l.id} value={String(l.id)}>
                          {l.fullName} {l.leadId ? `(${l.leadId})` : ''} 
                          {l.weddingDate ? ` — ${new Date(l.weddingDate).toLocaleDateString()}` : ''}
                          {l.status ? ` [${l.status.toUpperCase()}]` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  {filteredLeads.length === 0 && leadSearch && (
                    <p className="absolute -bottom-5 left-0 text-[10px] text-red-500">No matching leads found</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="currency" className="text-xs font-semibold text-gray-500 uppercase">
                    Currency
                  </Label>
                  <select
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    disabled={isPending}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="quotationDate" className="text-xs font-semibold text-gray-500 uppercase">
                    Date
                  </Label>
                  <Input
                    id="quotationDate"
                    type="date"
                    value={quotationDate}
                    onChange={(e) => setQuotationDate(e.target.value)}
                    disabled={isPending}
                    className="rounded-lg border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-xs font-semibold text-gray-500 uppercase">
                    Quotation Status
                  </Label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as typeof status)}
                    className="w-full rounded-lg border border-gray-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    disabled={isPending}
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="agencyFeePercent" className="text-xs font-semibold text-gray-500 uppercase">
                    Agency Fee (%)
                  </Label>
                  <div className="relative">
                    <Input
                      id="agencyFeePercent"
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={agencyFeePercent}
                      onChange={(e) => setAgencyFeePercent(Number(e.target.value))}
                      disabled={isPending}
                      className="rounded-lg border-gray-200 pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-400 text-sm">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Categories + items ─── */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Line Items & Services</h2>
            <button
              type="button"
              onClick={addCategory}
              className="px-3 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center gap-1 border border-blue-100"
              disabled={isPending}
            >
              <IconPlus className="h-3 w-3" />
              Add Category
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {categories.map((cat, ci) => (
              <div key={ci} className="p-4 sm:p-6 space-y-4">
                {/* Category header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <IconGripVertical className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={cat.categoryName}
                      onChange={(e) => updateCategoryName(ci, e.target.value)}
                      placeholder="Enter Category Name (e.g. Floral Decor)"
                      className="flex-1 bg-white border-b-2 border-transparent focus:border-blue-500 font-bold text-gray-800 focus:outline-none py-1 transition-all placeholder:font-normal placeholder:text-gray-300"
                      disabled={isPending}
                    />
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => addItem(ci)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1.5"
                      disabled={isPending}
                    >
                      <IconPlus className="h-3.5 w-3.5" />
                      Add Item
                    </button>
                    {categories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCategory(ci)}
                        className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
                        disabled={isPending}
                      >
                        Remove Category
                      </button>
                    )}
                  </div>
                </div>

                {/* Items table */}
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[10px] font-bold uppercase text-gray-400 bg-gray-50/50">
                        <th className="px-4 py-3 text-left w-12">#</th>
                        <th className="px-4 py-3 text-left">Particulars / Service Description</th>
                        <th className="px-4 py-3 text-right w-36">Rate ({currencySymbol})</th>
                        <th className="px-4 py-3 text-right w-24">Qty</th>
                        <th className="px-4 py-3 text-right w-40">Total ({currencySymbol})</th>
                        <th className="px-4 py-3 text-left w-40">Remarks</th>
                        <th className="px-2 py-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {cat.items.map((item, ii) => {
                        const rowTotal = (item.amount || 0) * (item.quantity || 1)
                        const globalIdx =
                          categories.slice(0, ci).reduce((s, c) => s + c.items.length, 0) + ii + 1

                        return (
                          <tr key={ii} className="group hover:bg-gray-50/30 transition-colors">
                            <td className="px-4 py-3.5 text-gray-300 font-mono text-xs">{globalIdx.toString().padStart(2, '0')}</td>
                            <td className="px-4 py-3.5">
                              <input
                                type="text"
                                value={item.particulars}
                                onChange={(e) => updateItem(ci, ii, 'particulars', e.target.value)}
                                placeholder="Service or Item Name"
                                className="w-full bg-transparent focus:outline-none font-medium text-gray-700 placeholder:text-gray-200"
                                disabled={isPending}
                              />
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center justify-end gap-1.5 font-medium text-gray-600">
                                <span className="text-gray-300 text-xs">{currencySymbol}</span>
                                <input
                                  type="number"
                                  value={item.amount || ''}
                                  onChange={(e) =>
                                    updateItem(ci, ii, 'amount', Number(e.target.value) || 0)
                                  }
                                  className="w-24 bg-transparent text-right focus:outline-none"
                                  placeholder="0.00"
                                  min={0}
                                  disabled={isPending}
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <input
                                type="number"
                                value={item.quantity || ''}
                                onChange={(e) =>
                                  updateItem(ci, ii, 'quantity', Number(e.target.value) || 1)
                                }
                                className="w-full bg-transparent text-right focus:outline-none font-medium text-gray-600"
                                placeholder="1"
                                min={1}
                                disabled={isPending}
                              />
                            </td>
                            <td className="px-4 py-3.5 text-right font-bold text-gray-900 bg-blue-50/20 group-hover:bg-blue-50/40 transition-all">
                              {currencySymbol}{fmt(rowTotal)}
                            </td>
                            <td className="px-4 py-3.5">
                              <input
                                type="text"
                                value={item.remarks}
                                onChange={(e) => updateItem(ci, ii, 'remarks', e.target.value)}
                                placeholder="Optional note"
                                className="w-full bg-transparent text-xs focus:outline-none text-gray-400 italic placeholder:text-gray-200"
                                disabled={isPending}
                              />
                            </td>
                            <td className="px-2 py-3.5 text-center">
                              {cat.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeItem(ci, ii)}
                                  className="p-1 rounded text-gray-200 hover:text-red-500 hover:bg-red-50 transition-all"
                                  disabled={isPending}
                                >
                                  <IconTrash className="h-4 w-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Summary & Calculations ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
             <div className="bg-white rounded-2xl border shadow-sm p-6">
               <Label htmlFor="notes" className="text-xs font-bold text-gray-500 uppercase mb-3 block">Terms & Additional Notes</Label>
               <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Payment terms, validity, or general remarks for the client..."
                  className="w-full h-32 rounded-xl border-gray-200 text-sm focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all p-4"
                  disabled={isPending}
               />
             </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#1a2744] rounded-2xl shadow-xl p-6 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <svg className="h-32 w-32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
                </svg>
              </div>
              
              <h3 className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-6">Financial Summary</h3>
              
              <div className="space-y-4 relative">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100/60">Subtotal</span>
                  <span className="font-mono font-bold leading-none">{currencySymbol}{fmt(subTotal)}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-100/60 flex items-center gap-1.5">
                    Agency Fees
                    <span className="bg-blue-400/20 text-[10px] px-1.5 py-0.5 rounded border border-blue-400/30 text-blue-100">{agencyFeePercent}%</span>
                  </span>
                  <span className="font-mono font-bold leading-none">{currencySymbol}{fmt(agencyFees)}</span>
                </div>

                <div className="pt-6 mt-2 border-t border-blue-400/20 flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase text-blue-200 tracking-wider">Grand Total Amount</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-mono font-black">{currencySymbol}{fmt(grandTotal)}</span>
                    <span className="text-[10px] font-bold text-blue-300/60 uppercase">{currency}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href={backHref} className="flex-1">
                <Button type="button" variant="outline" disabled={isPending} className="w-full rounded-xl h-11 border-gray-200 font-bold text-gray-600 hover:bg-gray-100">
                  Discard
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </div>
                ) : (
                  'Create Quotation'
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

