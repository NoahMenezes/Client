'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ActionState = { success: boolean; message: string } | null

export async function createFormField(prev: ActionState, fd: FormData): Promise<ActionState> {
  const label = fd.get('label') as string
  const fieldType = fd.get('fieldType') as string
  
  if (!label || !fieldType) return { success: false, message: 'Label and Field Type are required.' }

  let ok = false
  try {
    const payload = await getPayload({ config: configPromise })
    
    // Parse options for select fields
    const optionsRaw = fd.get('options') as string
    const options = optionsRaw ? optionsRaw.split('\n').filter(o => o.trim()).map(o => ({ value: o.trim() })) : undefined

    await payload.create({
      collection: 'form-fields',
      overrideAccess: true,
      data: {
        label,
        fieldType: fieldType as any,
        required: fd.get('required') === 'on',
        sortOrder: Number(fd.get('sortOrder')) || 0,
        options,
      },
    })
    ok = true
  } catch (e: unknown) {
    return { success: false, message: e instanceof Error ? e.message : 'Failed to create form field.' }
  }
  if (ok) { revalidatePath('/dashboard/settings'); redirect('/dashboard/settings') }
  return { success: false, message: 'Unknown error.' }
}

export async function deleteService(fd: FormData) {
  const id = fd.get('id') as string
  try {
    const payload = await getPayload({ config: configPromise })
    await payload.delete({ collection: 'services', id, overrideAccess: true })
  } catch (e) { console.error(e) }
  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/services')
}

export async function deleteFormField(fd: FormData) {
  const id = fd.get('id') as string
  try {
    const payload = await getPayload({ config: configPromise })
    await payload.delete({ collection: 'form-fields', id, overrideAccess: true })
  } catch (e) { console.error(e) }
  revalidatePath('/dashboard/settings')
}
