'use client'

import React, { useState, useTransition, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createNote, deleteNote } from '@/app/actions/notes'
import { deleteQuotation } from '@/app/actions/quotations'
import { assignEmployee } from '@/app/actions/leads'
import {
  IconTrash,
  IconPencil,
  IconPinnedFilled,
  IconFileText,
  IconDownload,
} from '@tabler/icons-react'

interface Employee {
  id: number | string
  name: string
  email: string
}

interface Note {
  id: number | string
  content: string
  createdBy: string
  pinned: boolean
  createdAt: string
}

interface QuotationCategory {
  categoryName: string
  items: Array<{
    particulars: string
    amount: number
    quantity: number
    total?: number
    remarks?: string
  }>
}

interface Quotation {
  id: number | string
  title: string
  grandTotal: number
  status: string
  quotationDate: string | null
  categories: QuotationCategory[]
}

interface Lead {
  id: number | string
  leadId?: string | null
  fullName: string
  email: string
  phone?: string | null
  status: string
  checkInDate?: string | null
  checkOutDate?: string | null
  weddingDate?: string | null
  budget?: number | null
  coupleName?: string | null
  leadSource?: string | null
  internalNotes?: string
  basicInformation?: string
  hospitalityServices?: string
  typesOfServiceRequired?: string
  artistsRequirement?: string
  googleFormEnquiry?: string
  firstCallDate?: string | null
  proposalSentDate?: string | null
  pocName?: string | null
  servicesRequested: string[]
  assignedEmployee?: { id: number | string; name: string } | null
  quotation: unknown[]
  grandTotal: number
}

const statusStyles: Record<string, string> = {
  opportunity: 'bg-orange-100 text-orange-700',
  prospect: 'bg-yellow-100 text-yellow-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  'no-response': 'bg-gray-100 text-gray-600',
  disqualified: 'bg-red-100 text-red-700',
  'lost-prospect': 'bg-red-50 text-red-500',
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

const quotationStatusStyles: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

function fmt(n: number) {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 0 })
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatDateShort(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function LeadProfileTabs({
  lead,
  employees,
  notes: initialNotes,
  quotations: initialQuotations,
  initialTab = 'info',
}: {
  lead: Lead
  employees: Employee[]
  notes: Note[]
  quotations: Quotation[]
  initialTab?: string
}) {
  const [activeTab, setActiveTab] = useState<'info' | 'notes' | 'quotations'>(
    (initialTab as 'info' | 'notes' | 'quotations') || 'info',
  )
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [quotations] = useState<Quotation[]>(initialQuotations)
  const [noteText, setNoteText] = useState('')
  const [noteAuthor, setNoteAuthor] = useState('Admin')
  const [addingNote, startAddingNote] = useTransition()
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null)
  const [noteError, setNoteError] = useState('')
  const [deletingQuotationId, setDeletingQuotationId] = useState<string | null>(null)
  const router = useRouter()
  const noteFormRef = useRef<HTMLFormElement>(null)

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteText.trim()) return
    setNoteError('')

    const fd = new FormData()
    fd.set('content', noteText.trim())
    fd.set('leadId', String(lead.id))
    fd.set('createdBy', noteAuthor || 'Admin')

    startAddingNote(async () => {
      const result = await createNote(null, fd)
      if (result?.success) {
        setNotes((prev) => [
          {
            id: Date.now(),
            content: noteText.trim(),
            createdBy: noteAuthor || 'Admin',
            pinned: false,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ])
        setNoteText('')
        noteFormRef.current?.reset()
        router.refresh()
      } else {
        setNoteError(result?.message || 'Failed to add note.')
      }
    })
  }

  const handleDeleteNote = async (noteId: string | number) => {
    setDeletingNoteId(String(noteId))
    const fd = new FormData()
    fd.set('id', String(noteId))
    fd.set('leadId', String(lead.id))
    await deleteNote(fd)
    setNotes((prev) => prev.filter((n) => String(n.id) !== String(noteId)))
    setDeletingNoteId(null)
    router.refresh()
  }

  const handleDeleteQuotation = async (quotationId: string | number) => {
    if (!confirm('Delete this quotation? This cannot be undone.')) return
    setDeletingQuotationId(String(quotationId))
    const fd = new FormData()
    fd.set('id', String(quotationId))
    fd.set('leadId', String(lead.id))
    await deleteQuotation(fd)
    setDeletingQuotationId(null)
    router.refresh()
  }

  const tabs = [
    { id: 'info', label: 'INFO' },
    { id: 'notes', label: 'NOTES' },
    { id: 'quotations', label: 'QUOTATIONS' },
  ] as const

  return (
    <div className="flex flex-col h-full">
      {/* Tab header */}
      <div className="bg-white border-b flex items-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3.5 text-sm font-semibold tracking-wide transition-colors border-b-2 text-center ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        {/* ─────────────────────── INFO TAB ─────────────────────── */}
        {activeTab === 'info' && (
          <div className="p-6 space-y-6">
            {/* Lead Owner + Edit */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1.5">Lead Owner</p>
                <select
                  defaultValue={
                    typeof lead.assignedEmployee === 'object' && lead.assignedEmployee !== null
                      ? String(lead.assignedEmployee.id)
                      : ''
                  }
                  className="rounded-lg border bg-white px-3 py-2 text-sm pr-8 min-w-45 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={async (e) => {
                    const fd = new FormData()
                    fd.set('leadId', String(lead.id))
                    fd.set('employeeId', e.target.value)
                    await assignEmployee(fd)
                    router.refresh()
                  }}
                >
                  <option value="">Not Assigned</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={String(emp.id)}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>
              <Link href={`/dashboard/leads/${lead.id}/edit`}>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-5">
                  Edit
                </Button>
              </Link>
            </div>

            {/* Lead Information section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Lead Information</h4>

              {/* Row 1: Full Name / Phone / Budget */}
              <div className="grid grid-cols-3 gap-x-6 gap-y-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Full Name</p>
                  <p className="text-gray-800 font-medium">{lead.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Phone</p>
                  <p className="text-gray-800 font-medium">{lead.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Budget</p>
                  <p className="text-gray-800 font-medium">
                    {lead.budget ? `₹ ${lead.budget.toLocaleString('en-IN')}` : '—'}
                  </p>
                </div>

                {/* Row 2: Email / Status / Couple Name */}
                <div>
                  <p className="text-xs text-gray-400 mb-1">Email</p>
                  <p className="text-gray-800 font-medium break-all">{lead.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <Badge
                    className={`text-xs ${statusStyles[lead.status] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {statusLabels[lead.status] || lead.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Couple Name</p>
                  <p className="text-gray-800 font-medium">{lead.coupleName || lead.fullName}</p>
                </div>

                {/* Row 3: Check-in Date / Check-out Date / Wedding Date */}
                <div>
                  <p className="text-xs text-gray-400 mb-1">Check-in Date</p>
                  <p className="text-gray-800 font-medium">{formatDate(lead.checkInDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Check-out Date</p>
                  <p className="text-gray-800 font-medium">{formatDate(lead.checkOutDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Wedding Date</p>
                  <p className="text-gray-800 font-medium">{formatDate(lead.weddingDate)}</p>
                </div>
              </div>
            </div>

            {/* Latest Note */}
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Latest Note</p>
              <div className="rounded-lg border bg-gray-50/50 px-4 py-3 text-sm text-gray-700 min-h-20 whitespace-pre-wrap">
                {lead.internalNotes || '—'}
              </div>
            </div>

            {/* Additional info row: Couple Name / Lead Source / Wedding Date */}
            <div className="grid grid-cols-3 gap-x-6 gap-y-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">Couple Name</p>
                <div className="rounded-lg border bg-gray-50/50 px-3 py-2 text-sm text-gray-700">
                  {lead.coupleName || lead.fullName}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Lead Source</p>
                <select
                  defaultValue={lead.leadSource || 'website'}
                  className="w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled
                >
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="social-media">Social Media</option>
                  <option value="walk-in">Walk-in</option>
                  <option value="phone-call">Phone Call</option>
                  <option value="email">Email</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Wedding Date</p>
                <div className="rounded-lg border bg-gray-50/50 px-3 py-2 text-sm text-gray-700">
                  {lead.weddingDate || '—'}
                </div>
              </div>
            </div>

            {/* Sales timeline row */}
            <div className="grid grid-cols-3 gap-x-6 gap-y-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">First Call Date</p>
                <div className="rounded-lg border bg-gray-50/50 px-3 py-2 text-sm text-gray-700">
                  {lead.firstCallDate || '—'}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Proposal Sent Date</p>
                <div className="rounded-lg border bg-gray-50/50 px-3 py-2 text-sm text-gray-700">
                  {lead.proposalSentDate || '—'}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">POC Name</p>
                <div className="rounded-lg border bg-gray-50/50 px-3 py-2 text-sm text-gray-700">
                  {lead.pocName || '—'}
                </div>
              </div>
            </div>

            {/* Check-in Date / Google Form Enquiry */}
            <div className="grid grid-cols-3 gap-x-6 gap-y-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">Check-in Date</p>
                <div className="rounded-lg border bg-gray-50/50 px-3 py-2 text-sm text-gray-700">
                  {lead.checkInDate || '—'}
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-400 mb-1">Google Form Enquiry</p>
                <div className="rounded-lg border bg-gray-50/50 px-3 py-2 text-sm text-gray-700 min-h-15 whitespace-pre-wrap">
                  {lead.googleFormEnquiry || '—'}
                </div>
              </div>
            </div>

            {/* Bottom text boxes: Basic Information / Hospitality / Types of Service */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border bg-blue-50/30 p-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">Basic Information</p>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {lead.basicInformation || '—'}
                </p>
              </div>
              <div className="rounded-xl border bg-blue-50/30 p-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Hospitality &amp; Misc. Services
                </p>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {lead.hospitalityServices || '—'}
                </p>
              </div>
              <div className="rounded-xl border bg-blue-50/30 p-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Types of Service Required
                </p>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {lead.typesOfServiceRequired || lead.servicesRequested.join(', ') || '—'}
                </p>
              </div>
            </div>

            {/* Artists Requirement */}
            {lead.artistsRequirement && (
              <div className="rounded-xl border bg-blue-50/30 p-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">Artists Requirement</p>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {lead.artistsRequirement}
                </p>
              </div>
            )}

            {/* Update Details button */}
            <div className="flex justify-end pt-2">
              <Link href={`/dashboard/leads/${lead.id}/edit`}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                  Update Details
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ─────────────────────── NOTES TAB ─────────────────────── */}
        {activeTab === 'notes' && (
          <div className="p-6 space-y-5">
            {/* Add note form */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Add Note</h4>
              {noteError && (
                <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
                  {noteError}
                </div>
              )}
              <form ref={noteFormRef} onSubmit={handleAddNote} className="space-y-3">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Start typing to leave a note..."
                  rows={4}
                  className="w-full rounded-lg border bg-white px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                  required
                />
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={noteAuthor}
                    onChange={(e) => setNoteAuthor(e.target.value)}
                    placeholder="Your name"
                    className="rounded-lg border bg-white px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={addingNote || !noteText.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  >
                    {addingNote ? 'Saving...' : 'Save Note'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Notes list */}
            {notes.length === 0 ? (
              <div className="py-10 text-center text-gray-400">
                <IconFileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No notes yet. Add one above.</p>
              </div>
            ) : (
              <div className="space-y-0 divide-y">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className={`py-4 flex items-start gap-3 ${
                      note.pinned ? 'bg-blue-50/30 -mx-2 px-2 rounded-lg' : ''
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {note.pinned ? (
                        <IconPinnedFilled className="h-4 w-4 text-blue-500" />
                      ) : (
                        <IconFileText className="h-4 w-4 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Created By: {note.createdBy} · Created At:{' '}
                        {new Date(note.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}{' '}
                        {new Date(note.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        title={note.pinned ? 'Unpin' : 'Pin'}
                        className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                        onClick={async () => {
                          const { togglePinNote } = await import('@/app/actions/notes')
                          const fd = new FormData()
                          fd.set('id', String(note.id))
                          fd.set('leadId', String(lead.id))
                          fd.set('pinned', String(note.pinned))
                          await togglePinNote(fd)
                          setNotes((prev) =>
                            prev.map((n) =>
                              String(n.id) === String(note.id) ? { ...n, pinned: !n.pinned } : n,
                            ),
                          )
                        }}
                      >
                        {note.pinned ? 'Unpin' : 'Pin'}
                      </button>
                      <span className="text-gray-300">·</span>
                      <button
                        type="button"
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                        disabled={deletingNoteId === String(note.id)}
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination info */}
            {notes.length > 0 && (
              <div className="flex items-center justify-between pt-2 text-xs text-gray-400">
                <span>
                  Showing 1 to {notes.length} of {notes.length} records
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-gray-600 font-medium">1/1</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────── QUOTATIONS TAB ─────────────────────── */}
        {activeTab === 'quotations' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">Quotations</h4>
              <Link
                href={`/dashboard/quotations/new?leadId=${lead.id}&leadName=${encodeURIComponent(lead.fullName)}`}
              >
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4">
                  Create Quotation
                </Button>
              </Link>
            </div>

            {quotations.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <IconFileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">
                  No quotations yet. Click &quot;Create Quotation&quot; to start.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                        Services Summary
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 w-36">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations.map((q, idx) => {
                      const servicesSummary =
                        q.title ||
                        q.categories
                          .map((c) => c.categoryName)
                          .slice(0, 3)
                          .join(', ')

                      return (
                        <tr
                          key={q.id}
                          className="border-b last:border-0 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-gray-600">
                            Q{String(idx + 1).padStart(3, '0')}
                          </td>
                          <td className="px-4 py-3 font-semibold text-blue-600">
                            ₹{fmt(q.grandTotal)}
                          </td>
                          <td className="px-4 py-3 text-gray-600 max-w-50 truncate">
                            {servicesSummary || '—'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link href={`/dashboard/quotations/${q.id}/print`} target="_blank">
                                <button
                                  type="button"
                                  title="Download"
                                  className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                  <IconDownload className="h-4 w-4" />
                                </button>
                              </Link>
                              <Link href={`/dashboard/quotations/${q.id}/edit`}>
                                <button
                                  type="button"
                                  title="Edit"
                                  className="p-1.5 rounded-md text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                                >
                                  <IconPencil className="h-4 w-4" />
                                </button>
                              </Link>
                              <button
                                type="button"
                                title="Delete"
                                disabled={deletingQuotationId === String(q.id)}
                                onClick={() => handleDeleteQuotation(q.id)}
                                className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                              >
                                <IconTrash className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
