'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface LeadDetail {
  id: string | number
  leadId?: string | null
  fullName: string
  email: string
  phone?: string | null
  status: string
  checkInDate?: string | null
  checkOutDate?: string | null
  internalNotes?: string
  servicesRequested?: string[]
  assignedEmployee?: { id: string | number; name: string } | null
}

export interface Note {
  id: string | number
  content: string
  createdBy: string
  pinned: boolean
  createdAt: string
}

interface QuotationSummary {
  id: string | number
  title: string
  grandTotal: number
  status: string
  quotationDate?: string | null
  categories?: Array<{ categoryName: string }>
}

interface Props {
  lead?: LeadDetail
  notes?: Note[]
  quotations?: QuotationSummary[]
  initialTab?: string
}

// ─── Status config ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  opportunity: 'bg-orange-100 text-orange-700',
  prospect: 'bg-yellow-100 text-yellow-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
  'in-progress': 'bg-blue-100 text-blue-700',
}

const STATUS_LABELS: Record<string, string> = {
  opportunity: 'Opportunity',
  prospect: 'Prospect',
  won: 'Won',
  lost: 'Lost',
  'in-progress': 'In Progress',
}

const QUOTATION_STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

function fmt(n: number) {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 0 })
}

const DEFAULT_LEAD: LeadDetail = {
  id: '',
  fullName: 'Unknown Lead',
  email: '',
  status: 'opportunity',
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function LeadDetailContent({
  lead = DEFAULT_LEAD,
  notes = [],
  quotations = [],
  initialTab = 'info',
}: Props) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [noteText, setNoteText] = useState('')
  const [localNotes, setLocalNotes] = useState<Note[]>(notes)

  const initials = lead.fullName.charAt(0).toUpperCase()

  const addNote = () => {
    if (!noteText.trim()) return
    const newNote: Note = {
      id: Date.now(),
      content: noteText.trim(),
      createdBy: 'Admin',
      pinned: false,
      createdAt: new Date().toISOString(),
    }
    setLocalNotes((prev) => [newNote, ...prev])
    setNoteText('')
  }

  const TABS = [
    { key: 'info', label: 'Lead Info' },
    { key: 'notes', label: 'Notes' },
    { key: 'quotations', label: 'Quotations' },
    { key: 'followups', label: 'Follow-ups' },
  ]

  return (
    <div className="flex flex-1 flex-col min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="flex items-center justify-end px-6 py-3 gap-3 border-b bg-white">
        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 gap-0">
        {/* Left sidebar */}
        <aside className="w-64 shrink-0 border-r bg-white flex flex-col items-center py-8 px-5 gap-4">
          <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
            {initials}
          </div>

          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-900">{lead.fullName}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Lead ID: {lead.leadId || `PK-${lead.id}`}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-1">
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.61 5a2 2 0 0 1 1.99-2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </a>
            )}
            <a
              href={`mailto:${lead.email}`}
              className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </a>
          </div>

          <div className="w-full space-y-3 text-sm mt-2">
            {lead.phone && (
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Mobile</p>
                <p className="text-gray-800 font-medium mt-0.5">{lead.phone}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Email</p>
              <p className="text-gray-800 font-medium mt-0.5 break-all">{lead.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Lead Status</p>
              <div className="mt-1">
                <Badge className={`text-xs ${STATUS_STYLES[lead.status] || ''}`}>
                  {STATUS_LABELS[lead.status] || lead.status}
                </Badge>
              </div>
            </div>
            {lead.assignedEmployee && (
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  Lead Assigned By
                </p>
                <p className="text-gray-800 font-medium mt-0.5">{lead.assignedEmployee.name}</p>
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {/* Tab bar */}
          <div className="border-b bg-white px-6 flex gap-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === t.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Lead Info */}
            {activeTab === 'info' && (
              <div className="space-y-4 max-w-2xl">
                <div className="bg-white rounded-xl border shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Lead Details</h3>
                    <Link href={`/dashboard/leads/${lead.id}/edit`}>
                      <Button size="sm" variant="outline">Edit Lead</Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {[
                      { label: 'Full Name', value: lead.fullName },
                      { label: 'Email', value: lead.email },
                      { label: 'Phone', value: lead.phone || '—' },
                      { label: 'Status', value: STATUS_LABELS[lead.status] || lead.status },
                      { label: 'Check-in Date', value: lead.checkInDate || '—' },
                      { label: 'Check-out Date', value: lead.checkOutDate || '—' },
                    ].map((row) => (
                      <div key={row.label}>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                          {row.label}
                        </p>
                        <p className="text-gray-800 font-medium mt-0.5">{row.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {(lead.servicesRequested?.length ?? 0) > 0 && (
                  <div className="bg-white rounded-xl border shadow-sm p-5">
                    <h3 className="font-semibold text-gray-900 mb-3">Services Requested</h3>
                    <div className="flex flex-wrap gap-2">
                      {lead.servicesRequested!.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 rounded-full text-xs bg-blue-50 text-blue-600 font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {activeTab === 'notes' && (
              <div className="space-y-4 max-w-2xl">
                <div className="bg-white rounded-xl border shadow-sm p-4">
                  <textarea
                    rows={3}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a note..."
                    className="w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      size="sm"
                      className="bg-blue-600 text-white hover:bg-blue-700"
                      onClick={addNote}
                    >
                      Add Note
                    </Button>
                  </div>
                </div>
                {localNotes.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-8">No notes yet.</p>
                ) : (
                  localNotes.map((n) => (
                    <div key={n.id} className="bg-white rounded-xl border shadow-sm p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">{n.createdBy}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(n.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{n.content}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Quotations */}
            {activeTab === 'quotations' && (
              <div className="space-y-4 max-w-3xl">
                <div className="flex justify-end">
                  <Link href="/dashboard/quotations/new">
                    <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                      + New Quotation
                    </Button>
                  </Link>
                </div>
                {quotations.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-8">No quotations yet.</p>
                ) : (
                  <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50 text-xs uppercase text-gray-400">
                          <th className="px-5 py-3 text-left font-medium">Title</th>
                          <th className="px-5 py-3 text-left font-medium">Amount</th>
                          <th className="px-5 py-3 text-left font-medium">Status</th>
                          <th className="px-5 py-3 text-left font-medium">Date</th>
                          <th className="px-5 py-3 text-right font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotations.map((q) => (
                          <tr key={q.id} className="border-b last:border-0 hover:bg-gray-50/50">
                            <td className="px-5 py-3 font-medium text-gray-800">{q.title}</td>
                            <td className="px-5 py-3 font-semibold text-gray-900">
                              ₹{fmt(q.grandTotal)}
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  QUOTATION_STATUS_STYLES[q.status] || 'bg-gray-100 text-gray-500'
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
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                    View
                                  </Button>
                                </Link>
                                <Link href={`/dashboard/quotations/${q.id}/edit`}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs text-blue-600"
                                  >
                                    Edit
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
              </div>
            )}

            {/* Follow-ups */}
            {activeTab === 'followups' && (
              <div className="max-w-2xl">
                <p className="text-center text-sm text-gray-400 py-8">No follow-ups scheduled.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <footer className="border-t px-6 py-3 bg-white flex items-center justify-center text-xs text-gray-400">
        © 2025 Perfect Knot CRM. All rights reserved.
      </footer>
    </div>
  )
}
