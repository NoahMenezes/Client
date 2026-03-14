'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/app/actions/auth'

export type ActionState = { success: boolean; message: string } | null

// ─── Helpers ──────────────────────────────────────────────────────────────────

function str(fd: FormData, key: string): string | undefined {
  const val = fd.get(key) as string | null
  return val && val.trim() !== '' ? val.trim() : undefined
}

function multiSelect(fd: FormData, key: string): string[] {
  return fd
    .getAll(key)
    .map((v) => String(v))
    .filter(Boolean)
}

/**
 * Build a Google-Form-style raw JSON payload from the FormData.
 * This mirrors the namedValues structure sent by Apps Script.
 */
function buildRawPayload(fd: FormData, contactName: string) {
  const ceremonies = multiSelect(fd, 'weddingCeremonies')
  const entertainment = multiSelect(fd, 'entertainmentOptions')
  const hospitality = multiSelect(fd, 'hospitalityServices')
  const additional = multiSelect(fd, 'additionalServices')
  const servicesList = multiSelect(fd, 'servicesLookingFor')

  return {
    timestamp: new Date().toISOString(),
    source: 'manual_entry',
    namedValues: {
      'Name of the Couple': [contactName],
      'What are the services you are looking for?': servicesList,
      'Resort Category': [str(fd, 'resortCategory') ?? ''],
      'Type of Cuisine?': [str(fd, 'cuisineType') ?? ''],
      'Check-in Date?': [str(fd, 'checkInDate') ?? ''],
      'Check Out Date?': [str(fd, 'checkOutDate') ?? ''],
      'Wedding Date': [str(fd, 'weddingDate') ?? ''],
      'Total Number of Guests for the Wedding': [str(fd, 'guestCount') ?? ''],
      'Kindly Select the Style of Wedding.': [str(fd, 'weddingStyle') ?? ''],
      'Kindly Select the various ceremonies/rituals which you would choose to have?': ceremonies,
      'Kindly Select the Entertainment Options & Artists which you would like to be arranged?':
        entertainment,
      'Kindly Select the Hospitality services you would like to be arranged.': hospitality,
      'Kindly Select the below services which you would like to include in the Package.':
        additional,
      'Kindly Specify the Total Budget Allocated for the Wedding.': [str(fd, 'budgetText') ?? ''],
      'Contact Number': [str(fd, 'phone') ?? ''],
      'Email Address': [str(fd, 'email') ?? ''],
      'From where did you find out about The Perfect Knot?': [str(fd, 'referralSource') ?? ''],
    },
  }
}

// ─── Create Lead ──────────────────────────────────────────────────────────────

export async function createLead(prev: ActionState, fd: FormData): Promise<ActionState> {
  const fullName = fd.get('fullName') as string
  const email = fd.get('email') as string
  if (!fullName || !email) return { success: false, message: 'Couple name and email are required.' }

  let newLeadId: string | number | null = null

  try {
    const payload = await getPayload({ config: configPromise })
    const currentUser = await getCurrentUser()

    const budgetRaw = fd.get('budget') as string
    const budget = budgetRaw && budgetRaw.trim() !== '' ? Number(budgetRaw) : undefined

    const guestCountRaw = fd.get('guestCount') as string
    const guestCount =
      guestCountRaw && guestCountRaw.trim() !== '' ? Number(guestCountRaw) : undefined

    // 1. Create or find Contact
    let contactId: number
    const existing = await payload.find({
      collection: 'contacts',
      where: { email: { equals: email.toLowerCase().trim() } },
      limit: 1,
      overrideAccess: true,
      pagination: false,
    })

    if (existing.docs.length > 0) {
      contactId = existing.docs[0].id as number
      await payload.update({
        collection: 'contacts',
        id: contactId,
        overrideAccess: true,
        data: {
          name: fullName,
          phone: str(fd, 'phone'),
          source: str(fd, 'referralSource'),
        },
      })
    } else {
      const contact = await payload.create({
        collection: 'contacts',
        overrideAccess: true,
        data: {
          name: fullName,
          email: email.toLowerCase().trim(),
          phone: str(fd, 'phone'),
          source: str(fd, 'referralSource'),
        },
      })
      contactId = contact.id as number
    }

    // 2. Build raw JSON payload (Google Form style)
    const rawPayload = buildRawPayload(fd, fullName)

    // 3. Create Lead linked to the contact
    const lead = await payload.create({
      collection: 'leads',
      overrideAccess: true,
      data: {
        contact: contactId,
        status: ((fd.get('status') as string) || 'new') as 'new',
        budget,
        budgetText: str(fd, 'budgetText'),
        guestCount,
        checkInDate: str(fd, 'checkInDate'),
        checkOutDate: str(fd, 'checkOutDate'),
        weddingDate: str(fd, 'weddingDate'),
        weddingStyle: str(fd, 'weddingStyle'),
        resortCategory: multiSelect(fd, 'resortCategory').join(', '),
        cuisineType: multiSelect(fd, 'cuisineType').join(', '),
        servicesLookedFor: str(fd, 'servicesLookingFor'),
        weddingCeremonies: multiSelect(fd, 'weddingCeremonies').join(', '),
        entertainmentOptions: multiSelect(fd, 'entertainmentOptions').join(', '),
        hospitalityServices: multiSelect(fd, 'hospitalityServices').join(', '),
        additionalServices: multiSelect(fd, 'additionalServices').join(', '),
        referralSource: str(fd, 'referralSource'),
        isDestination: fd.get('isDestination') === 'on' || fd.get('isDestination') === 'Yes',
        googleFormRawData: rawPayload,
        ...(currentUser ? { createdBy: currentUser.id } : {}),
      } as any,
    })
    newLeadId = lead.id
  } catch (e: unknown) {
    console.error('[createLead] error:', e)
    return { success: false, message: e instanceof Error ? e.message : 'Failed to create lead.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/leads')
  redirect(`/dashboard/leads/${newLeadId}`)
}

// ─── Update Lead ──────────────────────────────────────────────────────────────

export async function updateLead(prev: ActionState, fd: FormData): Promise<ActionState> {
  const id = fd.get('id') as string
  const fullName = fd.get('fullName') as string
  const email = fd.get('email') as string
  if (!id || !fullName || !email) return { success: false, message: 'Missing required fields.' }

  try {
    const payload = await getPayload({ config: configPromise })

    const budgetRaw = fd.get('budget') as string
    const budget = budgetRaw && budgetRaw.trim() !== '' ? Number(budgetRaw) : undefined

    const guestCountRaw = fd.get('guestCount') as string
    const guestCount =
      guestCountRaw && guestCountRaw.trim() !== '' ? Number(guestCountRaw) : undefined

    // Get current lead to find contact
    const currentLead = await payload.findByID({
      collection: 'leads',
      id,
      overrideAccess: true,
      depth: 0,
    })

    // Update contact if linked
    if (currentLead.contact) {
      const contactId =
        typeof currentLead.contact === 'object'
          ? (currentLead.contact as any).id
          : currentLead.contact
      await payload.update({
        collection: 'contacts',
        id: contactId,
        overrideAccess: true,
        data: {
          name: fullName,
          email: email.toLowerCase().trim(),
          phone: str(fd, 'phone'),
          source: str(fd, 'referralSource'),
        },
      })
    }

    // Re-build raw JSON for updated lead
    const rawPayload = buildRawPayload(fd, fullName)

    // Update lead
    await payload.update({
      collection: 'leads',
      id,
      overrideAccess: true,
      data: {
        status: ((fd.get('status') as string) || 'new') as 'new',
        budget,
        budgetText: str(fd, 'budgetText'),
        guestCount,
        checkInDate: str(fd, 'checkInDate'),
        checkOutDate: str(fd, 'checkOutDate'),
        weddingDate: str(fd, 'weddingDate'),
        weddingStyle: str(fd, 'weddingStyle'),
        resortCategory: multiSelect(fd, 'resortCategory').join(', '),
        cuisineType: multiSelect(fd, 'cuisineType').join(', '),
        servicesLookedFor: str(fd, 'servicesLookingFor'),
        weddingCeremonies: multiSelect(fd, 'weddingCeremonies').join(', '),
        entertainmentOptions: multiSelect(fd, 'entertainmentOptions').join(', '),
        hospitalityServices: multiSelect(fd, 'hospitalityServices').join(', '),
        additionalServices: multiSelect(fd, 'additionalServices').join(', '),
        referralSource: str(fd, 'referralSource'),
        isDestination: fd.get('isDestination') === 'on' || fd.get('isDestination') === 'Yes',
        googleFormRawData: rawPayload,
      } as any,
    })
  } catch (e: unknown) {
    console.error('[updateLead] error:', e)
    return { success: false, message: e instanceof Error ? e.message : 'Failed to update lead.' }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/leads/${id}`)
  redirect(`/dashboard/leads/${id}`)
}

// ─── Delete Lead ──────────────────────────────────────────────────────────────

export async function deleteLead(fd: FormData) {
  const id = fd.get('id') as string
  try {
    const payload = await getPayload({ config: configPromise })
    await payload.delete({ collection: 'leads', id, overrideAccess: true })
  } catch (e) {
    console.error(e)
  }
  revalidatePath('/dashboard')
  redirect('/dashboard/leads')
}

// ─── Update Quotation ─────────────────────────────────────────────────────────

export async function updateQuotation(prev: ActionState, fd: FormData): Promise<ActionState> {
  const id = fd.get('id') as string
  const raw = fd.get('quotation') as string
  if (!id || !raw) return { success: false, message: 'Missing data.' }

  let ok = false
  try {
    const payload = await getPayload({ config: configPromise })
    const items = JSON.parse(raw) as Array<{ service: string; pricePerUnit: number; units: number }>
    await payload.update({
      collection: 'leads',
      id,
      overrideAccess: true,
      data: { quotation: items } as any,
    })
    ok = true
  } catch (e: unknown) {
    return { success: false, message: e instanceof Error ? e.message : 'Failed to save quotation.' }
  }
  if (ok) {
    revalidatePath('/dashboard')
    redirect(`/dashboard/leads/${id}`)
  }
  return { success: false, message: 'Unknown error.' }
}

// ─── Assign Employee ──────────────────────────────────────────────────────────

export async function assignEmployee(fd: FormData) {
  const leadId = fd.get('leadId') as string
  const userId = fd.get('employeeId') as string
  if (!leadId || !userId) return
  try {
    const payload = await getPayload({ config: configPromise })
    await payload.update({
      collection: 'leads',
      id: leadId,
      overrideAccess: true,
      data: { assignedTo: Number(userId) },
    })
  } catch (e) {
    console.error(e)
  }
  revalidatePath('/dashboard')
  redirect(`/dashboard/leads/${leadId}`)
}
