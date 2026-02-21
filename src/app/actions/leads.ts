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
    const services = fd.getAll('servicesRequested') as string[]

    const budgetRaw = fd.get('budget') as string
    const budget = budgetRaw && budgetRaw.trim() !== '' ? Number(budgetRaw) : undefined

    const str = (key: string) => {
      const val = fd.get(key) as string | null
      return val && val.trim() !== '' ? val.trim() : undefined
    }

    await payload.create({
      collection: 'leads',
      overrideAccess: true,
      data: {
        fullName,
        email,
        phone: str('phone'),
        status: ((fd.get('status') as string) || 'opportunity') as
          | 'opportunity'
          | 'prospect'
          | 'won'
          | 'lost'
          | 'in-progress'
          | 'no-response'
          | 'disqualified'
          | 'lost-prospect',
        coupleName: str('coupleName'),
        leadSource:
          (str('leadSource') as
            | 'website'
            | 'referral'
            | 'social-media'
            | 'walk-in'
            | 'phone-call'
            | 'email'
            | 'other'
            | undefined) ?? 'website',
        budget,
        pocName: str('pocName'),
        checkInDate: str('checkInDate'),
        checkOutDate: str('checkOutDate'),
        weddingDate: str('weddingDate'),
        firstCallDate: str('firstCallDate'),
        proposalSentDate: str('proposalSentDate'),
        servicesRequested:
          services.length > 0
            ? (services as (
                | 'venue-decoration'
                | 'catering'
                | 'photography'
                | 'dj-music'
                | 'mehendi'
                | 'florals'
                | 'lighting'
                | 'hospitality'
                | 'baraat'
                | 'special-effects'
              )[])
            : undefined,
        basicInformation: str('basicInformation'),
        hospitalityServices: str('hospitalityServices'),
        typesOfServiceRequired: str('typesOfServiceRequired'),
        artistsRequirement: str('artistsRequirement'),
        internalNotes: str('internalNotes'),
        googleFormEnquiry: str('googleFormEnquiry'),
      },
    })
    ok = true
  } catch (e: unknown) {
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
    const services = fd.getAll('servicesRequested') as string[]

    const budgetRaw = fd.get('budget') as string
    const budget = budgetRaw && budgetRaw.trim() !== '' ? Number(budgetRaw) : undefined

    const str = (key: string) => {
      const val = fd.get(key) as string | null
      return val && val.trim() !== '' ? val.trim() : undefined
    }

    await payload.update({
      collection: 'leads',
      id,
      overrideAccess: true,
      data: {
        fullName,
        email,
        phone: str('phone'),
        status: ((fd.get('status') as string) || 'opportunity') as
          | 'opportunity'
          | 'prospect'
          | 'won'
          | 'lost'
          | 'in-progress'
          | 'no-response'
          | 'disqualified'
          | 'lost-prospect',
        coupleName: str('coupleName'),
        leadSource:
          (str('leadSource') as
            | 'website'
            | 'referral'
            | 'social-media'
            | 'walk-in'
            | 'phone-call'
            | 'email'
            | 'other'
            | undefined) ?? 'website',
        budget,
        pocName: str('pocName'),
        checkInDate: str('checkInDate'),
        checkOutDate: str('checkOutDate'),
        weddingDate: str('weddingDate'),
        firstCallDate: str('firstCallDate'),
        proposalSentDate: str('proposalSentDate'),
        servicesRequested:
          services.length > 0
            ? (services as (
                | 'venue-decoration'
                | 'catering'
                | 'photography'
                | 'dj-music'
                | 'mehendi'
                | 'florals'
                | 'lighting'
                | 'hospitality'
                | 'baraat'
                | 'special-effects'
              )[])
            : [],
        basicInformation: str('basicInformation'),
        hospitalityServices: str('hospitalityServices'),
        typesOfServiceRequired: str('typesOfServiceRequired'),
        artistsRequirement: str('artistsRequirement'),
        internalNotes: str('internalNotes'),
        googleFormEnquiry: str('googleFormEnquiry'),
      },
    })
    ok = true
  } catch (e: unknown) {
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
      data: { quotation: items },
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
  const employeeId = fd.get('employeeId') as string
  if (!leadId || !employeeId) return
  try {
    const payload = await getPayload({ config: configPromise })
    await payload.update({
      collection: 'leads',
      id: leadId,
      overrideAccess: true,
      data: { assignedEmployee: Number(employeeId) },
    })
  } catch (e) {
    console.error(e)
  }
  revalidatePath('/dashboard')
  redirect(`/dashboard/leads/${leadId}`)
}
