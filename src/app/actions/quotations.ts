'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ActionState = { success: boolean; message: string } | null

export interface QuotationCategory {
  categoryName: string
  items: Array<{
    particulars: string
    amount: number
    quantity: number
    total?: number
    remarks?: string
  }>
}

export async function createQuotation(prev: ActionState, fd: FormData): Promise<ActionState> {
  const title = fd.get('title') as string
  const leadId = fd.get('leadId') as string

  if (!title || !leadId) return { success: false, message: 'Title and lead are required.' }

  let newId: string | number | null = null
  try {
    const payload = await getPayload({ config: configPromise })

    const categoriesRaw = fd.get('categories') as string
    const categories: QuotationCategory[] = categoriesRaw ? JSON.parse(categoriesRaw) : []
    const agencyFeePercent = Number(fd.get('agencyFeePercent') || 12)
    const quotationDate = (fd.get('quotationDate') as string) || undefined
    const status = (fd.get('status') as string) || 'draft'
    const notes = (fd.get('notes') as string) || undefined

    const result = await payload.create({
      collection: 'quotations',
      overrideAccess: true,
      data: {
        title,
        lead: Number(leadId),
        categories,
        agencyFeePercent,
        quotationDate,
        status: status as 'draft' | 'sent' | 'approved' | 'rejected',
        notes,
        subTotal: 0,
        agencyFees: 0,
        grandTotal: 0,
      },
    })
    newId = result.id
  } catch (e: unknown) {
    return {
      success: false,
      message: e instanceof Error ? e.message : 'Failed to create quotation.',
    }
  }

  revalidatePath(`/dashboard/leads/${leadId}`)
  revalidatePath('/dashboard/quotations')
  if (newId) redirect(`/dashboard/quotations/${newId}`)
  return { success: false, message: 'Unknown error.' }
}

export async function updateQuotationById(prev: ActionState, fd: FormData): Promise<ActionState> {
  const id = fd.get('id') as string
  const leadId = fd.get('leadId') as string
  const title = fd.get('title') as string

  if (!id) return { success: false, message: 'Quotation ID is required.' }

  try {
    const payload = await getPayload({ config: configPromise })

    const categoriesRaw = fd.get('categories') as string
    const categories: QuotationCategory[] = categoriesRaw ? JSON.parse(categoriesRaw) : []
    const agencyFeePercent = Number(fd.get('agencyFeePercent') || 12)
    const quotationDate = (fd.get('quotationDate') as string) || undefined
    const status = (fd.get('status') as string) || 'draft'
    const notes = (fd.get('notes') as string) || undefined

    await payload.update({
      collection: 'quotations',
      id,
      overrideAccess: true,
      data: {
        categories,
        agencyFeePercent,
        status: status as 'draft' | 'sent' | 'approved' | 'rejected',
        subTotal: 0,
        agencyFees: 0,
        grandTotal: 0,
        ...(title ? { title } : {}),
        ...(quotationDate ? { quotationDate } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    })
  } catch (e: unknown) {
    return {
      success: false,
      message: e instanceof Error ? e.message : 'Failed to update quotation.',
    }
  }

  revalidatePath(`/dashboard/quotations/${id}`)
  if (leadId) revalidatePath(`/dashboard/leads/${leadId}`)
  revalidatePath('/dashboard/quotations')
  redirect(`/dashboard/quotations/${id}`)
}

export async function deleteQuotation(fd: FormData) {
  const id = fd.get('id') as string
  const leadId = fd.get('leadId') as string

  try {
    const payload = await getPayload({ config: configPromise })
    await payload.delete({ collection: 'quotations', id, overrideAccess: true })
  } catch (e) {
    console.error('deleteQuotation error:', e)
  }

  if (leadId) {
    revalidatePath(`/dashboard/leads/${leadId}`)
    redirect(`/dashboard/leads/${leadId}?tab=quotations`)
  } else {
    revalidatePath('/dashboard/quotations')
    redirect('/dashboard/quotations')
  }
}

export async function duplicateQuotation(fd: FormData): Promise<ActionState> {
  const id = fd.get('id') as string
  if (!id) return { success: false, message: 'ID required.' }

  let newId: string | number | null = null
  try {
    const payload = await getPayload({ config: configPromise })
    const original = await payload.findByID({ collection: 'quotations', id, overrideAccess: true })
    if (!original) return { success: false, message: 'Quotation not found.' }

    const leadId =
      typeof original.lead === 'object' && original.lead !== null
        ? (original.lead as { id: number | string }).id
        : original.lead

    const result = await payload.create({
      collection: 'quotations',
      overrideAccess: true,
      data: {
        title: `${original.title} (Copy)`,
        lead: leadId as number,
        categories: (original.categories ?? []) as QuotationCategory[],
        agencyFeePercent: original.agencyFeePercent ?? 12,
        quotationDate: original.quotationDate ?? undefined,
        status: 'draft',
        notes: original.notes ?? undefined,
        subTotal: 0,
        agencyFees: 0,
        grandTotal: 0,
      },
    })
    newId = result.id
  } catch (e: unknown) {
    return { success: false, message: e instanceof Error ? e.message : 'Failed to duplicate.' }
  }

  revalidatePath('/dashboard/quotations')
  if (newId) redirect(`/dashboard/quotations/${newId}`)
  return { success: false, message: 'Unknown error.' }
}
