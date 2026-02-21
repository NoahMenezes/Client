'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const SERVICES = [
  { label: 'Venue Decoration', value: 'venue-decoration' },
  { label: 'Catering', value: 'catering' },
  { label: 'Photography', value: 'photography' },
  { label: 'DJ & Music', value: 'dj-music' },
  { label: 'Mehendi', value: 'mehendi' },
  { label: 'Florals', value: 'florals' },
  { label: 'Lighting', value: 'lighting' },
  { label: 'Hospitality', value: 'hospitality' },
  { label: 'Baraat', value: 'baraat' },
  { label: 'Special Effects', value: 'special-effects' },
]

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b pb-2 mb-4 mt-6 first:mt-0">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{children}</h3>
    </div>
  )
}

export default function AddLeadPage() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fullName = (form.elements.namedItem('fullName') as HTMLInputElement).value.trim()
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim()

    setError('')
    if (!fullName || !email) {
      setError('Full name and email are required.')
      return
    }
    setIsPending(true)
    setTimeout(() => {
      setIsPending(false)
      setSuccess(true)
    }, 800)
  }

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-700 text-sm">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold">Add New Lead</h1>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="text-lg">Lead Details</CardTitle>
          <p className="text-sm text-muted-foreground">
            Fill out the form below to create a new lead. Fields marked with * are required.
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 ring-1 ring-green-200">
              Lead saved successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-0">
            {/* ── Contact Information ── */}
            <SectionHeading>Contact Information</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-blue-600">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="e.g. Eleanor Vance"
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupleName" className="text-blue-600">
                  Couple Name
                </Label>
                <Input
                  id="coupleName"
                  name="coupleName"
                  placeholder="e.g. Eleanor & Mark Vance"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-600">
                  Email *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-blue-600">
                  Phone
                </Label>
                <Input id="phone" name="phone" placeholder="+91 98765 43210" disabled={isPending} />
              </div>
            </div>

            {/* ── Lead Details ── */}
            <SectionHeading>Lead Details</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-blue-600">
                  Status
                </Label>
                <select
                  id="status"
                  name="status"
                  defaultValue="opportunity"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                  disabled={isPending}
                >
                  <option value="opportunity">Opportunity</option>
                  <option value="prospect">Prospect</option>
                  <option value="in-progress">In Progress</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                  <option value="no-response">No Response</option>
                  <option value="disqualified">Disqualified</option>
                  <option value="lost-prospect">Lost Prospect</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="leadSource" className="text-blue-600">
                  Lead Source
                </Label>
                <select
                  id="leadSource"
                  name="leadSource"
                  defaultValue="website"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                  disabled={isPending}
                >
                  <option value="website">Website Enquiry</option>
                  <option value="referral">Referral</option>
                  <option value="social-media">Social Media</option>
                  <option value="walk-in">Walk-in</option>
                  <option value="phone-call">Phone Call</option>
                  <option value="email">Email</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-blue-600">
                  Budget (₹)
                </Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  placeholder="e.g. 500000"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <Label htmlFor="pocName" className="text-blue-600">
                POC Name
              </Label>
              <Input
                id="pocName"
                name="pocName"
                placeholder="Point of Contact name"
                disabled={isPending}
              />
            </div>

            {/* ── Event Dates ── */}
            <SectionHeading>Event Dates</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="checkInDate" className="text-blue-600">
                  Check-in Date
                </Label>
                <Input id="checkInDate" name="checkInDate" type="date" disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOutDate" className="text-blue-600">
                  Check-out Date
                </Label>
                <Input id="checkOutDate" name="checkOutDate" type="date" disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weddingDate" className="text-blue-600">
                  Wedding / Event Date
                </Label>
                <Input id="weddingDate" name="weddingDate" type="date" disabled={isPending} />
              </div>
            </div>

            {/* ── Sales Timeline ── */}
            <SectionHeading>Sales Timeline</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="firstCallDate" className="text-blue-600">
                  First Call Date
                </Label>
                <Input id="firstCallDate" name="firstCallDate" type="date" disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proposalSentDate" className="text-blue-600">
                  Proposal Sent Date
                </Label>
                <Input
                  id="proposalSentDate"
                  name="proposalSentDate"
                  type="date"
                  disabled={isPending}
                />
              </div>
            </div>

            {/* ── Services Requested ── */}
            <SectionHeading>Services Requested</SectionHeading>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
              {SERVICES.map((s) => (
                <label
                  key={s.value}
                  className="flex items-center gap-2 text-sm rounded-md border px-3 py-2 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors has-checked:bg-blue-50 has-checked:border-blue-400"
                >
                  <input
                    type="checkbox"
                    name="servicesRequested"
                    value={s.value}
                    disabled={isPending}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{s.label}</span>
                </label>
              ))}
            </div>

            {/* ── Event Details ── */}
            <SectionHeading>Event Details</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="basicInformation" className="text-blue-600">
                  Basic Information
                </Label>
                <textarea
                  id="basicInformation"
                  name="basicInformation"
                  rows={4}
                  placeholder="e.g. Traditional Indian Wedding, approx. 300 guests, 3-day event."
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-600"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospitalityServices" className="text-blue-600">
                  Hospitality &amp; Misc. Services
                </Label>
                <textarea
                  id="hospitalityServices"
                  name="hospitalityServices"
                  rows={4}
                  placeholder="e.g. Guest accommodation for 100 people, local transport for VIPs."
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-600"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="typesOfServiceRequired" className="text-blue-600">
                  Types of Service Required
                </Label>
                <textarea
                  id="typesOfServiceRequired"
                  name="typesOfServiceRequired"
                  rows={4}
                  placeholder="e.g. Venue Decor, Catering, Photography, DJ & Music, Hospitality."
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-600"
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <Label htmlFor="artistsRequirement" className="text-blue-600">
                Artists Requirement
              </Label>
              <textarea
                id="artistsRequirement"
                name="artistsRequirement"
                rows={3}
                placeholder="e.g. Live band for Sangeet, DJ for reception, traditional dancers for ceremony."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-600"
                disabled={isPending}
              />
            </div>

            {/* ── Notes & Enquiry ── */}
            <SectionHeading>Notes &amp; Enquiry</SectionHeading>
            <div className="space-y-2 mb-4">
              <Label htmlFor="internalNotes" className="text-blue-600">
                Internal Notes
              </Label>
              <textarea
                id="internalNotes"
                name="internalNotes"
                rows={3}
                placeholder="Internal team notes about this lead..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-600"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2 mb-6">
              <Label htmlFor="googleFormEnquiry" className="text-blue-600">
                Google Form Enquiry
              </Label>
              <textarea
                id="googleFormEnquiry"
                name="googleFormEnquiry"
                rows={5}
                placeholder="Paste the raw response from the client intake Google Form here..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-600"
                disabled={isPending}
              />
            </div>

            {/* ── Actions ── */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Link href="/dashboard">
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={isPending}
              >
                {isPending ? 'Saving…' : 'Save Lead'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
