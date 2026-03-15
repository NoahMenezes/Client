'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { updateLead, type ActionState } from '@/app/actions/leads'

// ─── Constants (same as Add form) ─────────────────────────────────────────────

import { DatePicker } from '@/components/date-picker'

const STAGES = [
  { id: 1, label: 'Lead Metadata', description: 'Basic info & contact details' },
  { id: 2, label: 'Bride & Groom', description: 'Couple & wedding details' },
  { id: 3, label: 'Items & Requirements', description: 'Services & preferences' },
]

const WEDDING_CEREMONIES = [
  'Sangeet',
  'Haldi',
  'Mehendi',
  'Baarat',
  'Pheras',
  'Engagement',
  'Ring Ceremony',
  'Reception',
  'After Party',
  'Myra Ceremony',
]
const ENTERTAINMENT_OPTIONS = [
  'Photographers & Cinematographers',
  'Bridal Makeup Artists',
  'Guest Makeup Artists',
  'Emcee',
  'DJ',
  'Band',
  'Choreographers',
  'Dance Troupe',
  'Dholwala',
  'Brass Band',
  'Vintage Car',
  'Safa Wala',
  'Fireworks',
]
const HOSPITALITY_SERVICES = [
  'RSVP',
  'Logistics Support',
  'Airport Representatives',
  'Guest Welcome In Lobby',
  'Transportation Coordination',
  'Honeymoon Planning',
]
const ADDITIONAL_SERVICES = [
  'Wedding Invite',
  'Welcome Hampers',
  'Return Gifts',
  'Wedding Cake',
  'Professional Mixologist',
  'Hookah',
  'Mithai Boxes',
  'Live Bangle Maker',
  'Liquid Support',
  'Safabandi for Baarat',
  'Vintage Car for Baarat',
]
const SERVICES_LOOKING_FOR = [
  'End to End Wedding Planning',
  'Assistance in Hotel Booking',
  'Partial Planning',
  'Day-of Coordination',
  'Décor & Design Only',
]

function csvToArray(csv: string | null | undefined): string[] {
  if (!csv) return []
  return csv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-[#1a2744] mb-1 uppercase tracking-wide">
      {children} {required && <span className="text-rose-500">*</span>}
    </label>
  )
}

function InputField({
  id,
  name,
  type = 'text',
  placeholder,
  required,
  disabled,
  value,
  onChange,
}: {
  id: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      value={value}
      onChange={onChange}
      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2744]/30 focus:border-[#1a2744] transition-all disabled:opacity-50"
    />
  )
}

function SelectField({
  id,
  name,
  children,
  disabled,
  value,
  onChange,
}: {
  id: string
  name: string
  children: React.ReactNode
  disabled?: boolean
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) {
  return (
    <select
      id={id}
      name={name}
      disabled={disabled}
      value={value}
      onChange={onChange}
      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a2744]/30 focus:border-[#1a2744] transition-all disabled:opacity-50"
    >
      {children}
    </select>
  )
}

function MultiCheckGroup({
  name,
  options,
  selected,
  onChange,
  disabled,
}: {
  name: string
  options: string[]
  selected: string[]
  onChange: (val: string[]) => void
  disabled?: boolean
}) {
  const toggle = (opt: string) =>
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt])

  return (
    <div className="flex flex-wrap gap-2">
      {selected.map((v) => (
        <input key={v} type="hidden" name={name} value={v} />
      ))}
      {options.map((opt) => {
        const active = selected.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => !disabled && toggle(opt)}
            disabled={disabled}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all select-none disabled:opacity-50 ${
              active
                ? 'bg-[#1a2744] text-white border-[#1a2744] shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a2744] hover:text-[#1a2744]'
            }`}
          >
            {active ? '✓ ' : ''}
            {opt}
          </button>
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EditLeadClient({ lead }: { lead: any }) {
  const [stage, setStage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // --- FORM STATE ---
  // We use controlled components to preserve state across stages.
  const contact = typeof lead.contact === 'object' && lead.contact ? lead.contact : {}
  const [formData, setFormData] = useState({
    fullName: contact.name || lead.fullName || '',
    email: contact.email || lead.email || '',
    phone: contact.phone || lead.phone || '',
    status: lead.status || 'new',
    referralSource: lead.referralSource || '',
    budget: lead.budget ? String(lead.budget) : '',
    budgetText: lead.budgetText || '',
    checkInDate: lead.checkInDate ? lead.checkInDate.split('T')[0] : '',
    checkOutDate: lead.checkOutDate ? lead.checkOutDate.split('T')[0] : '',
    weddingDate: lead.weddingDate ? lead.weddingDate.split('T')[0] : '',
    guestCount: lead.guestCount ? String(lead.guestCount) : '',
    weddingStyle: lead.weddingStyle || '',
    resortCategory: lead.resortCategory || '',
    cuisineType: lead.cuisineType || '',
    isDestination: !!lead.isDestination,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const isCheckbox = type === 'checkbox'
    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  // Multi-select states
  const [servicesLookingFor, setServicesLookingFor] = useState<string[]>(
    csvToArray(lead.servicesLookedFor),
  )
  const [ceremonies, setCeremonies] = useState<string[]>(csvToArray(lead.weddingCeremonies))
  const [entertainment, setEntertainment] = useState<string[]>(
    csvToArray(lead.entertainmentOptions),
  )
  const [hospitality, setHospitality] = useState<string[]>(csvToArray(lead.hospitalityServices))
  const [additional, setAdditional] = useState<string[]>(csvToArray(lead.additionalServices))

  const handleSave = async () => {
    // Create FormData and append all state values
    const fd = new FormData()
    fd.append('id', String(lead.id))
    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        if (value) fd.append(key, 'on')
      } else {
        fd.append(key, value)
      }
    })
    servicesLookingFor.forEach((v) => fd.append('servicesLookingFor', v))
    ceremonies.forEach((v) => fd.append('weddingCeremonies', v))
    entertainment.forEach((v) => fd.append('entertainmentOptions', v))
    hospitality.forEach((v) => fd.append('hospitalityServices', v))
    additional.forEach((v) => fd.append('additionalServices', v))

    setError(null)
    startTransition(async () => {
      const result: ActionState = await updateLead(null, fd)
      if (result && !result.success) {
        setError(result.message)
        setStage(1)
      }
    })
  }

  const leadDisplayId = lead.leadId || `PK-${lead.id}`

  return (
    <div className="flex flex-1 flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 flex items-center gap-4">
        <Link
          href={`/dashboard/leads/${lead.id}`}
          className="text-gray-400 hover:text-gray-700 text-sm transition-colors"
        >
          ← Back to Lead
        </Link>
        <div className="h-4 w-px bg-gray-200" />
        <h1 className="text-lg font-bold text-[#1a2744]">Edit Lead — {formData.fullName}</h1>
        <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
          {leadDisplayId}
        </span>
      </div>

      <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center gap-0">
            {STAGES.map((s, i) => {
              const isCompleted = stage > s.id
              const isActive = stage === s.id
              return (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setStage(s.id)}
                      className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                        isCompleted
                          ? 'bg-[#1a2744] border-[#1a2744] text-white'
                          : isActive
                            ? 'bg-white border-[#1a2744] text-[#1a2744]'
                            : 'bg-white border-gray-200 text-gray-400'
                      }`}
                    >
                      {isCompleted ? '✓' : s.id}
                    </button>
                    <div className="text-center">
                      <p
                        className={`text-xs font-semibold ${isActive ? 'text-[#1a2744]' : 'text-gray-400'}`}
                      >
                        {s.label}
                      </p>
                      <p className="text-[10px] text-gray-400 hidden sm:block">{s.description}</p>
                    </div>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-3 -mt-4.5 transition-all ${
                        stage > s.id ? 'bg-[#1a2744]' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={(e) => e.preventDefault()}>
          {/* No hidden inputs needed for controlled components */}

          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="border-b px-6 py-4 bg-linear-to-r from-[#1a2744]/5 to-transparent">
              <h2 className="text-base font-bold text-[#1a2744]">
                Stage {stage}: {STAGES[stage - 1].label}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{STAGES[stage - 1].description}</p>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Stage 1 */}
              {stage === 1 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <FieldLabel required>Couple&apos;s Full Name</FieldLabel>
                      <InputField
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange as any}
                        placeholder="e.g. Dhriti & Tarun"
                        required
                        disabled={isPending}
                      />
                    </div>
                    <div>
                      <FieldLabel required>Email Address</FieldLabel>
                      <InputField
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange as any}
                        placeholder="couple@example.com"
                        required
                        disabled={isPending}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <FieldLabel>Contact Number</FieldLabel>
                      <InputField
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange as any}
                        placeholder="+91 98765 43210"
                        disabled={isPending}
                      />
                    </div>
                    <div>
                      <FieldLabel>Lead Status</FieldLabel>
                      <SelectField
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange as any}
                        disabled={isPending}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="proposal_sent">Proposal Sent</option>
                        <option value="negotiation">Negotiation</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="closed">Closed</option>
                        <option value="cancelled">Cancelled</option>
                      </SelectField>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <FieldLabel>Referral Source</FieldLabel>
                      <InputField
                        id="referralSource"
                        name="referralSource"
                        value={formData.referralSource}
                        onChange={handleInputChange as any}
                        placeholder="e.g. WedmeGood, Instagram"
                        disabled={isPending}
                      />
                    </div>
                    <div>
                      <FieldLabel>Budget (₹ numeric)</FieldLabel>
                      <InputField
                        id="budget"
                        name="budget"
                        type="number"
                        value={formData.budget}
                        onChange={handleInputChange as any}
                        placeholder="e.g. 3500000"
                        disabled={isPending}
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Budget Description</FieldLabel>
                    <InputField
                      id="budgetText"
                      name="budgetText"
                      value={formData.budgetText}
                      onChange={handleInputChange as any}
                      placeholder='e.g. "35 Lakh INR (inclusive of all)"'
                      disabled={isPending}
                    />
                  </div>
                </div>
              )}

              {/* Stage 2 */}
              {stage === 2 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <FieldLabel>Check-in Date</FieldLabel>
                      <DatePicker
                        date={formData.checkInDate ? new Date(formData.checkInDate) : undefined}
                        setDate={(date) =>
                          setFormData((prev) => ({
                            ...prev,
                            checkInDate: date ? date.toISOString() : '',
                          }))
                        }
                        disabled={isPending}
                      />
                    </div>
                    <div>
                      <FieldLabel>Check-out Date</FieldLabel>
                      <DatePicker
                        date={formData.checkOutDate ? new Date(formData.checkOutDate) : undefined}
                        setDate={(date) =>
                          setFormData((prev) => ({
                            ...prev,
                            checkOutDate: date ? date.toISOString() : '',
                          }))
                        }
                        disabled={isPending}
                      />
                    </div>
                    <div>
                      <FieldLabel>Wedding Date</FieldLabel>
                      <DatePicker
                        date={formData.weddingDate ? new Date(formData.weddingDate) : undefined}
                        setDate={(date) =>
                          setFormData((prev) => ({
                            ...prev,
                            weddingDate: date ? date.toISOString() : '',
                          }))
                        }
                        disabled={isPending}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <FieldLabel>Total Number of Guests</FieldLabel>
                      <InputField
                        id="guestCount"
                        name="guestCount"
                        type="number"
                        value={formData.guestCount}
                        onChange={handleInputChange as any}
                        placeholder="e.g. 150"
                        disabled={isPending}
                      />
                    </div>
                    <div>
                      <FieldLabel>Style of Wedding</FieldLabel>
                      <SelectField
                        id="weddingStyle"
                        name="weddingStyle"
                        value={formData.weddingStyle}
                        onChange={handleInputChange as any}
                        disabled={isPending}
                      >
                        <option value="">Select style…</option>
                        <option value="hindu">Hindu Wedding</option>
                        <option value="islamic">Islamic Wedding</option>
                        <option value="catholic">Catholic Wedding</option>
                        <option value="sikh">Sikh Wedding</option>
                        <option value="jain">Jain Wedding</option>
                        <option value="inter_faith">Inter Faith Wedding</option>
                        <option value="other">Other</option>
                      </SelectField>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <FieldLabel>Resort Category</FieldLabel>
                      <SelectField
                        id="resortCategory"
                        name="resortCategory"
                        value={formData.resortCategory}
                        onChange={handleInputChange as any}
                        disabled={isPending}
                      >
                        <option value="">Select category…</option>
                        <option>3 Star</option>
                        <option>4 Star</option>
                        <option>5 Star</option>
                        <option>Heritage / Boutique</option>
                        <option>Palace Hotel</option>
                      </SelectField>
                    </div>
                    <div>
                      <FieldLabel>Type of Cuisine</FieldLabel>
                      <SelectField
                        id="cuisineType"
                        name="cuisineType"
                        value={formData.cuisineType}
                        onChange={handleInputChange as any}
                        disabled={isPending}
                      >
                        <option value="">Select cuisine…</option>
                        <option>Veg</option>
                        <option>Non-Veg</option>
                        <option>Both</option>
                        <option>Jain</option>
                      </SelectField>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isDestination"
                      name="isDestination"
                      checked={formData.isDestination}
                      onChange={handleInputChange as any}
                      className="h-4 w-4 rounded border-gray-300 text-[#1a2744] focus:ring-[#1a2744]"
                      disabled={isPending}
                    />
                    <label
                      htmlFor="isDestination"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Destination Wedding?
                    </label>
                  </div>
                </div>
              )}

              {/* Stage 3 */}
              {stage === 3 && (
                <div className="space-y-7">
                  <div>
                    <FieldLabel>Services Looking For</FieldLabel>
                    <p className="text-[11px] text-gray-400 mb-2">Select all that apply</p>
                    <MultiCheckGroup
                      name="servicesLookingFor"
                      options={SERVICES_LOOKING_FOR}
                      selected={servicesLookingFor}
                      onChange={setServicesLookingFor}
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <FieldLabel>Ceremonies & Rituals</FieldLabel>
                    <p className="text-[11px] text-gray-400 mb-2">Select all ceremonies required</p>
                    <MultiCheckGroup
                      name="weddingCeremonies"
                      options={WEDDING_CEREMONIES}
                      selected={ceremonies}
                      onChange={setCeremonies}
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <FieldLabel>Entertainment Options & Artists</FieldLabel>
                    <p className="text-[11px] text-gray-400 mb-2">
                      Select all entertainment required
                    </p>
                    <MultiCheckGroup
                      name="entertainmentOptions"
                      options={ENTERTAINMENT_OPTIONS}
                      selected={entertainment}
                      onChange={setEntertainment}
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <FieldLabel>Hospitality Services</FieldLabel>
                    <p className="text-[11px] text-gray-400 mb-2">Services for guest management</p>
                    <MultiCheckGroup
                      name="hospitalityServices"
                      options={HOSPITALITY_SERVICES}
                      selected={hospitality}
                      onChange={setHospitality}
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <FieldLabel>Additional Services</FieldLabel>
                    <p className="text-[11px] text-gray-400 mb-2">
                      Bespoke add-ons for the package
                    </p>
                    <MultiCheckGroup
                      name="additionalServices"
                      options={ADDITIONAL_SERVICES}
                      selected={additional}
                      onChange={setAdditional}
                      disabled={isPending}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                {stage > 1 && (
                  <button
                    type="button"
                    onClick={() => setStage(stage - 1)}
                    disabled={isPending}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50"
                  >
                    ← Previous
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/dashboard/leads/${lead.id}`}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </Link>

                {stage < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStage(stage + 1)}
                    disabled={isPending}
                    className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#1a2744] text-white hover:bg-[#243460] transition-all disabled:opacity-50 shadow-sm"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isPending}
                    className="px-6 py-2 text-sm font-semibold rounded-lg bg-[#1a2744] text-white hover:bg-[#243460] transition-all disabled:opacity-50 shadow-sm"
                  >
                    {isPending ? (
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Saving…
                      </span>
                    ) : (
                      'Save Changes ✓'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          Tip: You can click stage numbers above to jump between sections.
        </p>
      </div>
    </div>
  )
}
