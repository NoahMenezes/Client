'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'

export type ActionState = { success: boolean; message: string } | null

export async function createNote(prev: ActionState, fd: FormData): Promise<ActionState> {
  const content = fd.get('content') as string
  const leadId = fd.get('leadId') as string
  const createdBy = (fd.get('createdBy') as string) || 'Admin'

  if (!content || !leadId) return { success: false, message: 'Content and lead ID are required.' }

  try {
    const payload = await getPayload({ config: configPromise })
    await payload.create({
      collection: 'notes',
      overrideAccess: true,
      data: {
        lead: Number(leadId),
        content,
        createdBy,
        pinned: false,
      },
    })
  } catch (e: unknown) {
    return { success: false, message: e instanceof Error ? e.message : 'Failed to create note.' }
  }

  revalidatePath(`/dashboard/leads/${leadId}`)
  return { success: true, message: 'Note added successfully.' }
}

export async function deleteNote(fd: FormData): Promise<ActionState> {
  const id = fd.get('id') as string
  const leadId = fd.get('leadId') as string

  if (!id) return { success: false, message: 'Note ID is required.' }

  try {
    const payload = await getPayload({ config: configPromise })
    await payload.delete({ collection: 'notes', id, overrideAccess: true })
  } catch (e: unknown) {
    return { success: false, message: e instanceof Error ? e.message : 'Failed to delete note.' }
  }

  if (leadId) revalidatePath(`/dashboard/leads/${leadId}`)
  return { success: true, message: 'Note deleted.' }
}

export async function togglePinNote(fd: FormData): Promise<ActionState> {
  const id = fd.get('id') as string
  const leadId = fd.get('leadId') as string
  const pinned = fd.get('pinned') === 'true'

  if (!id) return { success: false, message: 'Note ID is required.' }

  try {
    const payload = await getPayload({ config: configPromise })
    await payload.update({
      collection: 'notes',
      id,
      overrideAccess: true,
      data: { pinned: !pinned },
    })
  } catch (e: unknown) {
    return { success: false, message: e instanceof Error ? e.message : 'Failed to update note.' }
  }

  if (leadId) revalidatePath(`/dashboard/leads/${leadId}`)
  return { success: true, message: 'Note updated.' }
}

export async function updateNote(prev: ActionState, fd: FormData): Promise<ActionState> {
  const id = fd.get('id') as string
  const content = fd.get('content') as string
  const leadId = fd.get('leadId') as string

  if (!id || !content) return { success: false, message: 'ID and content are required.' }

  try {
    const payload = await getPayload({ config: configPromise })
    await payload.update({
      collection: 'notes',
      id,
      overrideAccess: true,
      data: { content },
    })
  } catch (e: unknown) {
    return { success: false, message: e instanceof Error ? e.message : 'Failed to update note.' }
  }

  if (leadId) revalidatePath(`/dashboard/leads/${leadId}`)
  return { success: true, message: 'Note updated successfully.' }
}
