'use client'

import React, { useState, useTransition, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createNote, deleteNote } from '@/app/actions/notes'
import { deleteQuotation, duplicateQuotation } from '@/app/actions/quotations'
import { assignEmployee, deleteLead } from '@/app/actions/leads'
import {
  IconTrash,
  IconPencil,
  IconEye,
  IconPlus,
  IconPin,
  IconPinnedFilled,
  IconCopy,
  IconFileText,
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
  internalNotes?: string
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
        // Optimistic: add to local state
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
      <div className="bg-white border-b flex items-center gap-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 text-sm font-semibold tracking-wider transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto p-6">
        {/* ─────────────────────── INFO TAB ─────────────────────── */}
        {activeTab === 'info' && (
          <div className="space-y-5 max-w-5xl">
            {/* Lead Details card */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-base">Lead Details</h3>
                <Link href={`/dashboard/leads/${lead.id}/edit`}>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                    Update Details
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
                {/* Row 1 */}
                <div>
                  <p className="text-xs text-gray-400 mb-1">Lead Owner</p>
                  <div className="relative">
                    <select
                      defaultValue={
                        typeof lead.assignedEmployee === 'object' && lead.assignedEmployee !== null
                          ? String(lead.assignedEmployee.id)
                          : ''
                      }
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm pr-8"
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
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Budget</p>
                  <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    —
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Checkout Date</p>
                  <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    {lead.checkOutDate || '—'}
                  </div>
                </div>
              </div>

              {/* Services / wedding type */}
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-1">Type of Wedding / Services</p>
                <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-700 min-h-[60px]">
                  {lead.servicesRequested.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {lead.servicesRequested.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    '—'
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Couple Name / Full Name</p>
                  <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    {lead.fullName}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Lead Source</p>
                  <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    Website
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Wedding Date</p>
                  <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    {lead.checkInDate || '—'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-1">First Call Date</p>
                  <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    —
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Proposal Sent Date</p>
                  <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    —
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <div className="mt-0.5">
                    <Badge className={`text-xs ${statusStyles[lead.status] || ''}`}>
                      {lead.status === 'in-progress'
                        ? 'In Progress'
                        : (lead.status?.charAt(0).toUpperCase() ?? '') +
                          (lead.status?.slice(1) ?? '')}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm">
                <p className="text-xs text-gray-400 mb-1">POC Name</p>
                <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  —
                </div>
              </div>

              <div className="mt-4 text-sm">
                <p className="text-xs text-gray-400 mb-1">Google Form Enquiry / Internal Notes</p>
                <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-700 min-h-[80px] whitespace-pre-wrap">
                  {lead.internalNotes || '—'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Artists Requirement</p>
                  <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-700 min-h-[60px]">
                    —
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Types of Service Required</p>
                  <div className="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-700 min-h-[60px]">
                    {lead.servicesRequested.join(', ') || '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-end">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Back to Dashboard
                </Button>
              </Link>
              <form
                action={async (fd) => {
                  await deleteLead(fd)
                }}
              >
                <input type="hidden" name="id" value={String(lead.id)} />
                <Button type="submit" variant="destructive" size="sm">
                  Delete Lead
                </Button>
              </form>
              <Link href={`/dashboard/leads/${lead.id}/edit`}>
                <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                  Edit Lead
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ─────────────────────── NOTES TAB ─────────────────────── */}
        {activeTab === 'notes' && (
          <div className="max-w-3xl space-y-4">
            {/* Add note form */}
            <div className="bg-white rounded-xl border shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Add Note</h3>
              {noteError && (
                <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
                  {noteError}
                </div>
              )}
              <form ref={noteFormRef} onSubmit={handleAddNote} className="space-y-3">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Write a note about this lead..."
                  rows={3}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={noteAuthor}
                    onChange={(e) => setNoteAuthor(e.target.value)}
                    placeholder="Your name"
                    className="rounded-md border bg-background px-3 py-1.5 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={addingNote || !noteText.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <IconPlus className="h-4 w-4 mr-1" />
                    {addingNote ? 'Adding...' : 'Add Note'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Notes list */}
            {notes.length === 0 ? (
              <div className="bg-white rounded-xl border shadow-sm p-8 text-center text-gray-400">
                <IconFileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No notes yet. Add one above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className={`bg-white rounded-xl border shadow-sm p-4 transition-colors ${
                      note.pinned ? 'border-blue-200 bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          {note.pinned && (
                            <IconPinnedFilled className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          )}
                          <span className="text-xs font-semibold text-gray-600">
                            {note.createdBy}
                          </span>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-xs text-gray-400">{timeAgo(note.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {note.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          title={note.pinned ? 'Unpin' : 'Pin'}
                          className="p-1.5 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
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
                          {note.pinned ? (
                            <IconPinnedFilled className="h-4 w-4" />
                          ) : (
                            <IconPin className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          title="Delete note"
                          disabled={deletingNoteId === String(note.id)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <IconTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────── QUOTATIONS TAB ─────────────────────── */}
        {activeTab === 'quotations' && (
          <div className="max-w-5xl space-y-4">
            <div className="bg-white rounded-xl border shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Quotations</h3>
                <Link
                  href={`/dashboard/quotations/new?leadId=${lead.id}&leadName=${encodeURIComponent(lead.fullName)}`}
                >
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                    <IconPlus className="h-4 w-4 mr-1" />
                    Create Quotation
                  </Button>
                </Link>
              </div>

              {quotations.length === 0 ? (
                <div className="py-10 text-center text-gray-400">
                  <IconFileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">
                    No quotations yet. Click &quot;Create Quotation&quot; to start.
                  </p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase text-gray-400">
                      <th className="pb-2 text-left font-medium pl-1">ID</th>
                      <th className="pb-2 text-left font-medium">Title</th>
                      <th className="pb-2 text-left font-medium">Amount</th>
                      <th className="pb-2 text-left font-medium">Services Summary</th>
                      <th className="pb-2 text-left font-medium">Status</th>
                      <th className="pb-2 text-left font-medium">Date</th>
                      <th className="pb-2 text-right font-medium pr-1">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations.map((q, idx) => {
                      const servicesSummary = q.categories
                        .map((c) => c.categoryName)
                        .slice(0, 3)
                        .join(', ')

                      return (
                        <tr
                          key={q.id}
                          className="border-b last:border-0 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-3 pl-1 font-medium text-gray-500">
                            Q{String(idx + 1).padStart(3, '0')}
                          </td>
                          <td className="py-3 font-medium text-gray-800 max-w-[160px] truncate">
                            {q.title}
                          </td>
                          <td className="py-3 font-semibold text-gray-900">₹{fmt(q.grandTotal)}</td>
                          <td className="py-3 text-gray-500 max-w-[200px] truncate">
                            {servicesSummary || '—'}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                quotationStatusStyles[q.status] || 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 text-gray-500 text-xs">
                            {q.quotationDate
                              ? new Date(q.quotationDate).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
                          </td>
                          <td className="py-3 pr-1">
                            <div className="flex items-center justify-end gap-1">
                              <Link href={`/dashboard/quotations/${q.id}`}>
                                <button
                                  type="button"
                                  title="View"
                                  className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                  <IconEye className="h-4 w-4" />
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
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault()
                                  const fd = new FormData(e.currentTarget)
                                  duplicateQuotation(fd)
                                }}
                              >
                                <input type="hidden" name="id" value={String(q.id)} />
                                <button
                                  type="submit"
                                  title="Duplicate"
                                  className="p-1.5 rounded-md text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                                >
                                  <IconCopy className="h-4 w-4" />
                                </button>
                              </form>
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
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
