'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ActionState = { success: boolean; message: string } | null

export async function createLead(prev: ActionState, fd: FormData): Promise<ActionState> {
  const fullName = fd.get('fullName') as string
  const email = fd.get('email') as string
  if (!fullName || !email) return { success: false, message: 'Name and email required.' }

  let ok = false
  try {
    const payload = await getPayload({ config: configPromise })

    const str = (key: string) => {
      const val = fd.get(key) as string | null
      return val && val.trim() !== '' ? val.trim() : undefined
    }

    const budgetRaw = fd.get('budget') as string
    const budget = budgetRaw && budgetRaw.trim() !== '' ? Number(budgetRaw) : undefined

    const guestCountRaw = fd.get('guestCount') as string
    const guestCount = guestCountRaw && guestCountRaw.trim() !== '' ? Number(guestCountRaw) : undefined

    // 1. Create or find Contact
    let contactId: number
    const existing = await payload.find({
      collection: 'contacts',
      where: { email: { equals: email.toLowerCase().trim() } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      contactId = existing.docs[0].id
      // Update the contact with latest info
      await payload.update({
        collection: 'contacts',
        id: contactId,
        overrideAccess: true,
        data: {
          name: fullName,
          phone: str('phone') || undefined,
          source: str('leadSource') || undefined,
        },
      })
    } else {
      const contact = await payload.create({
        collection: 'contacts',
        overrideAccess: true,
        data: {
          name: fullName,
          email: email.toLowerCase().trim(),
          phone: str('phone'),
          source: str('leadSource'),
        },
      })
      contactId = contact.id
    }

    // 2. Create Lead linked to the contact
    await payload.create({
      collection: 'leads',
      overrideAccess: true,
      data: {
        contact: contactId,
        status: ((fd.get('status') as string) || 'new') as any,
        budget,
        guestCount,
        checkInDate: str('checkInDate'),
        checkOutDate: str('checkOutDate'),
        weddingDate: str('weddingDate'),
        weddingStyle: str('weddingStyle'),
        isDestination: fd.get('isDestination') === 'on',
      },
    })
    ok = true
  } catch (e: unknown) {
    console.error('[createLead] error:', e)
    return { success: false, message: e instanceof Error ? e.message : 'Failed to create lead.' }
  }
  if (ok) {
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/leads')
    redirect('/dashboard')
  }
  return { success: false, message: 'Unknown error.' }
}

export async function updateLead(prev: ActionState, fd: FormData): Promise<ActionState> {
  const id = fd.get('id') as string
  const fullName = fd.get('fullName') as string
  const email = fd.get('email') as string
  if (!id || !fullName || !email) return { success: false, message: 'Missing required fields.' }

  let ok = false
  try {
    const payload = await getPayload({ config: configPromise })

    const str = (key: string) => {
      const val = fd.get(key) as string | null
      return val && val.trim() !== '' ? val.trim() : undefined
    }

    const budgetRaw = fd.get('budget') as string
    const budget = budgetRaw && budgetRaw.trim() !== '' ? Number(budgetRaw) : undefined

    const guestCountRaw = fd.get('guestCount') as string
    const guestCount = guestCountRaw && guestCountRaw.trim() !== '' ? Number(guestCountRaw) : undefined

    // Get current lead to find contact
    const currentLead = await payload.findByID({
      collection: 'leads',
      id,
      overrideAccess: true,
      depth: 0,
    })

    // Update contact if linked
    if (currentLead.contact) {
      const contactId = typeof currentLead.contact === 'object' ? currentLead.contact.id : currentLead.contact
      await payload.update({
        collection: 'contacts',
        id: contactId,
        overrideAccess: true,
        data: {
          name: fullName,
          email: email.toLowerCase().trim(),
          phone: str('phone') || undefined,
          source: str('leadSource') || undefined,
        },
      })
    }

    // Update lead
    await payload.update({
      collection: 'leads',
      id,
      overrideAccess: true,
      data: {
        status: ((fd.get('status') as string) || 'new') as any,
        budget,
        guestCount,
        checkInDate: str('checkInDate'),
        checkOutDate: str('checkOutDate'),
        weddingDate: str('weddingDate'),
        weddingStyle: str('weddingStyle'),
        isDestination: fd.get('isDestination') === 'on',
      },
    })
    ok = true
  } catch (e: unknown) {
    console.error('[updateLead] error:', e)
    return { success: false, message: e instanceof Error ? e.message : 'Failed to update lead.' }
  }
  if (ok) {
    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/leads/${id}`)
    redirect(`/dashboard/leads/${id}`)
  }
  return { success: false, message: 'Unknown error.' }
}

export async function deleteLead(fd: FormData) {
  const id = fd.get('id') as string
  try {
    const payload = await getPayload({ config: configPromise })
    await payload.delete({ collection: 'leads', id, overrideAccess: true })
  } catch (e) {
    console.error(e)
  }
  revalidatePath('/dashboard')
  redirect('/dashboard')
}

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
