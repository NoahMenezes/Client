'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { createLead, type ActionState } from '@/app/actions/leads'
import { DatePicker } from '@/components/date-picker'

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Sub-components ───────────────────────────────────────────────────────────

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
  error,
}: {
  id: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: boolean
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
      className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
        error
          ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
          : 'border-gray-200 focus:ring-[#1a2744]/30 focus:border-[#1a2744]'
      }`}
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
  error,
}: {
  id: string
  name: string
  children: React.ReactNode
  disabled?: boolean
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  error?: boolean
}) {
  return (
    <select
      id={id}
      name={name}
      disabled={disabled}
      value={value}
      onChange={onChange}
      className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
        error
          ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
          : 'border-gray-200 focus:ring-[#1a2744]/30 focus:border-[#1a2744]'
      }`}
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
}: {
  name: string
  options: string[]
  selected: string[]
  onChange: (val: string[]) => void
}) {
  const toggle = (opt: string) =>
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt])

  return (
    <div className="flex flex-wrap gap-2">
      {/* Hidden inputs to submit selected values */}
      {selected.map((v) => (
        <input key={v} type="hidden" name={name} value={v} />
      ))}
      {options.map((opt) => {
        const active = selected.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all select-none ${
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

// ─── Stage 1: Lead Metadata ───────────────────────────────────────────────────

function Stage1({
  disabled,
  formData,
  onChange,
  errors,
}: {
  disabled: boolean
  formData: any
  onChange: any
  errors: any
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <FieldLabel required>Couple&apos;s Full Name</FieldLabel>
          <InputField
            id="fullName"
            name="fullName"
            placeholder="e.g. Dhriti & Tarun"
            required
            disabled={disabled}
            value={formData.fullName}
            onChange={onChange}
            error={!!errors.fullName}
          />
        </div>
        <div>
          <FieldLabel required>Email Address</FieldLabel>
          <InputField
            id="email"
            name="email"
            type="email"
            placeholder="couple@example.com"
            required
            disabled={disabled}
            value={formData.email}
            onChange={onChange}
            error={!!errors.email}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <FieldLabel>Contact Number</FieldLabel>
          <InputField
            id="phone"
            name="phone"
            placeholder="+91 98765 43210"
            disabled={disabled}
            value={formData.phone}
            onChange={onChange}
            error={!!errors.phone}
          />
        </div>
        <div>
          <FieldLabel>Lead Status</FieldLabel>
          <SelectField
            id="status"
            name="status"
            disabled={disabled}
            value={formData.status}
            onChange={onChange}
            error={!!errors.status}
          >
            <option value="confirmed">Confirmed</option>
            <option value="closed">Closed</option>
          </SelectField>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <FieldLabel>Referral Source</FieldLabel>
          <InputField
            id="referralSource"
            name="referralSource"
            placeholder="e.g. WedmeGood, Instagram, Friend"
            disabled={disabled}
            value={formData.referralSource}
            onChange={onChange}
            error={!!errors.referralSource}
          />
        </div>
        <div>
          <FieldLabel>Budget (₹ numeric)</FieldLabel>
          <InputField
            id="budget"
            name="budget"
            type="number"
            placeholder="e.g. 3500000"
            disabled={disabled}
            value={formData.budget}
            onChange={onChange}
            error={!!errors.budget}
          />
        </div>
      </div>

      <div>
        <FieldLabel>Budget Description</FieldLabel>
        <InputField
          id="budgetText"
          name="budgetText"
          placeholder='e.g. "35 Lakh INR (inclusive of all)"'
          disabled={disabled}
          value={formData.budgetText}
          onChange={onChange}
          error={!!errors.budgetText}
        />
      </div>
    </div>
  )
}

// ─── Stage 2: Bride & Groom Details ──────────────────────────────────────────

function Stage2({
  disabled,
  formData,
  onChange,
  setFormData,
  errors,
}: {
  disabled: boolean
  formData: any
  onChange: any
  setFormData: any
  errors: any
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className={errors.checkInDate ? 'rounded-md ring-2 ring-red-200' : ''}>
          <FieldLabel>Check-in Date</FieldLabel>
          <DatePicker
            date={formData.checkInDate ? new Date(formData.checkInDate) : undefined}
            setDate={(date) =>
              setFormData((prev: any) => ({
                ...prev,
                checkInDate: date ? date.toISOString() : '',
              }))
            }
            disabled={disabled}
            className={errors.checkInDate ? 'border-red-500' : ''}
          />
          <input type="hidden" name="checkInDate" value={formData.checkInDate} />
        </div>
        <div className={errors.checkOutDate ? 'rounded-md ring-2 ring-red-200' : ''}>
          <FieldLabel>Check-out Date</FieldLabel>
          <DatePicker
            date={formData.checkOutDate ? new Date(formData.checkOutDate) : undefined}
            setDate={(date) =>
              setFormData((prev: any) => ({
                ...prev,
                checkOutDate: date ? date.toISOString() : '',
              }))
            }
            disabled={disabled}
            className={errors.checkOutDate ? 'border-red-500' : ''}
          />
          <input type="hidden" name="checkOutDate" value={formData.checkOutDate} />
        </div>
        <div className={errors.weddingDate ? 'rounded-md ring-2 ring-red-200' : ''}>
          <FieldLabel>Wedding Date</FieldLabel>
          <DatePicker
            date={formData.weddingDate ? new Date(formData.weddingDate) : undefined}
            setDate={(date) =>
              setFormData((prev: any) => ({
                ...prev,
                weddingDate: date ? date.toISOString() : '',
              }))
            }
            disabled={disabled}
            className={errors.weddingDate ? 'border-red-500' : ''}
          />
          <input type="hidden" name="weddingDate" value={formData.weddingDate} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <FieldLabel>Total Number of Guests</FieldLabel>
          <InputField
            id="guestCount"
            name="guestCount"
            type="number"
            placeholder="e.g. 150"
            disabled={disabled}
            value={formData.guestCount}
            onChange={onChange}
            error={!!errors.guestCount}
          />
        </div>
        <div>
          <FieldLabel>Style of Wedding</FieldLabel>
          <SelectField
            id="weddingStyle"
            name="weddingStyle"
            disabled={disabled}
            value={formData.weddingStyle}
            onChange={onChange}
            error={!!errors.weddingStyle}
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
            disabled={disabled}
            value={formData.resortCategory}
            onChange={onChange}
            error={!!errors.resortCategory}
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
            disabled={disabled}
            value={formData.cuisineType}
            onChange={onChange}
            error={!!errors.cuisineType}
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
          onChange={onChange}
          className="h-4 w-4 rounded border-gray-300 text-[#1a2744] focus:ring-[#1a2744]"
          disabled={disabled}
        />
        <label htmlFor="isDestination" className="text-sm font-medium text-gray-700 cursor-pointer">
          Destination Wedding?
        </label>
      </div>
    </div>
  )
}

// ─── Stage 3: Items / Requirements ───────────────────────────────────────────

function Stage3({
  disabled: _disabled,
  servicesLookingFor,
  setServicesLookingFor,
  ceremonies,
  setCeremonies,
  entertainment,
  setEntertainment,
  hospitality,
  setHospitality,
  additional,
  setAdditional,
}: {
  disabled: boolean
  servicesLookingFor: string[]
  setServicesLookingFor: (val: string[]) => void
  ceremonies: string[]
  setCeremonies: (val: string[]) => void
  entertainment: string[]
  setEntertainment: (val: string[]) => void
  hospitality: string[]
  setHospitality: (val: string[]) => void
  additional: string[]
  setAdditional: (val: string[]) => void
}) {
  return (
    <div className="space-y-7">
      <div>
        <FieldLabel>Services Looking For</FieldLabel>
        <p className="text-[11px] text-gray-400 mb-2">Select all that apply</p>
        <MultiCheckGroup
          name="servicesLookingFor"
          options={SERVICES_LOOKING_FOR}
          selected={servicesLookingFor}
          onChange={setServicesLookingFor}
        />
      </div>

      <div>
        <FieldLabel>Ceremonies & Rituals</FieldLabel>
        <p className="text-[11px] text-gray-400 mb-2">
          Select all ceremonies the couple would like
        </p>
        <MultiCheckGroup
          name="weddingCeremonies"
          options={WEDDING_CEREMONIES}
          selected={ceremonies}
          onChange={setCeremonies}
        />
      </div>

      <div>
        <FieldLabel>Entertainment Options & Artists</FieldLabel>
        <p className="text-[11px] text-gray-400 mb-2">Select all entertainment required</p>
        <MultiCheckGroup
          name="entertainmentOptions"
          options={ENTERTAINMENT_OPTIONS}
          selected={entertainment}
          onChange={setEntertainment}
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
        />
      </div>

      <div>
        <FieldLabel>Additional Services</FieldLabel>
        <p className="text-[11px] text-gray-400 mb-2">Bespoke add-ons for the package</p>
        <MultiCheckGroup
          name="additionalServices"
          options={ADDITIONAL_SERVICES}
          selected={additional}
          onChange={setAdditional}
        />
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AddLeadPage() {
  const [stage, setStage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // State for form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    status: 'confirmed',
    referralSource: '',
    budget: '',
    budgetText: '',
    checkInDate: '',
    checkOutDate: '',
    weddingDate: '',
    guestCount: '',
    weddingStyle: '',
    resortCategory: '',
    cuisineType: '',
    isDestination: false,
  })

  // State for multi-check groups
  const [servicesLookingFor, setServicesLookingFor] = useState<string[]>([])
  const [ceremonies, setCeremonies] = useState<string[]>([])
  const [entertainment, setEntertainment] = useState<string[]>([])
  const [hospitality, setHospitality] = useState<string[]>([])
  const [additional, setAdditional] = useState<string[]>([])

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Collect the form ref so we can call FormData on it
  const formRef = React.useRef<HTMLFormElement>(null)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target
    const isCheckbox = type === 'checkbox'
    const finalValue = isCheckbox ? (e.target as HTMLInputElement).checked : value

    setFormData((prev) => ({ ...prev, [name]: finalValue }))

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateStage = (currentStage: number) => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    if (currentStage === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required'
      if (!formData.email.trim()) newErrors.email = 'Email is required'
    }

    if (currentStage === 2) {
      if (!formData.checkInDate) newErrors.checkInDate = 'Check-in Date is required'
      if (!formData.checkOutDate) newErrors.checkOutDate = 'Check-out Date is required'
      if (!formData.weddingDate) newErrors.weddingDate = 'Wedding Date is required'
      if (!formData.guestCount) newErrors.guestCount = 'Guest Count is required'
      if (!formData.weddingStyle) newErrors.weddingStyle = 'Wedding Style is required'
      if (!formData.resortCategory) newErrors.resortCategory = 'Resort Category is required'
      if (!formData.cuisineType) newErrors.cuisineType = 'Cuisine Type is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      isValid = false
    }

    return isValid
  }

  const goNext = () => {
    if (validateStage(stage)) {
      if (stage < 3) setStage(stage + 1)
    }
  }

  const goPrev = () => {
    if (stage > 1) setStage(stage - 1)
  }

  const handleSave = () => {
    if (!formRef.current) return
    const fd = new FormData(formRef.current)
    setError(null)
    startTransition(async () => {
      const result: ActionState = await createLead(null, fd)
      if (result && !result.success) {
        setError(result.message)
        setStage(1)
      }
    })
  }

  return (
    <div className="flex flex-1 flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 flex items-center gap-4">
        <Link
          href="/dashboard/leads"
          className="text-gray-400 hover:text-gray-700 text-sm transition-colors"
        >
          ← Back to Leads
        </Link>
        <div className="h-4 w-px bg-gray-200" />
        <h1 className="text-lg font-bold text-[#1a2744]">Add New Lead</h1>
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
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                        isCompleted
                          ? 'bg-[#1a2744] border-[#1a2744] text-white'
                          : isActive
                            ? 'bg-white border-[#1a2744] text-[#1a2744]'
                            : 'bg-white border-gray-200 text-gray-400'
                      }`}
                    >
                      {isCompleted ? '✓' : s.id}
                    </div>
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
                      className={`flex-1 h-0.5 mx-3 mt-[-18px] transition-all ${
                        stage > s.id ? 'bg-[#1a2744]' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Form Card */}
        <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="border-b px-6 py-4 bg-gradient-to-r from-[#1a2744]/5 to-transparent">
              <h2 className="text-base font-bold text-[#1a2744]">
                Stage {stage}: {STAGES[stage - 1].label}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{STAGES[stage - 1].description}</p>
            </div>

            {/* Body */}
            <div className="p-6">
              {error && (
                <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Always render all 3 stages but only show the active one */}
              <div className={stage === 1 ? 'block' : 'hidden'}>
                <Stage1
                  disabled={isPending}
                  formData={formData}
                  onChange={handleInputChange}
                  errors={errors}
                />
              </div>
              <div className={stage === 2 ? 'block' : 'hidden'}>
                <Stage2
                  disabled={isPending}
                  formData={formData}
                  onChange={handleInputChange}
                  setFormData={setFormData}
                  errors={errors}
                />
              </div>
              <div className={stage === 3 ? 'block' : 'hidden'}>
                <Stage3
                  disabled={isPending}
                  servicesLookingFor={servicesLookingFor}
                  setServicesLookingFor={setServicesLookingFor}
                  ceremonies={ceremonies}
                  setCeremonies={setCeremonies}
                  entertainment={entertainment}
                  setEntertainment={setEntertainment}
                  hospitality={hospitality}
                  setHospitality={setHospitality}
                  additional={additional}
                  setAdditional={setAdditional}
                />
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="border-t px-6 py-4 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                {stage > 1 && (
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={isPending}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50"
                  >
                    ← Previous
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/leads"
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </Link>

                {stage < 3 ? (
                  <button
                    type="button"
                    onClick={goNext}
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
                        Saving Lead…
                      </span>
                    ) : (
                      'Save Lead ✓'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
