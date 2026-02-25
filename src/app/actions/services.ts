'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ActionState = { success: boolean; message: string } | null

export async function createService(prev: ActionState, fd: FormData): Promise<ActionState> {
  const serviceName = fd.get('serviceName') as string
  const category = fd.get('category') as string
  const unit = fd.get('unit') as string
  const price = Number(fd.get('price'))

  if (!serviceName || !price)
    return { success: false, message: 'Service name and price are required.' }

  let ok = false
  try {
    const payload = await getPayload({ config: configPromise })
    await payload.create({
      collection: 'services',
      overrideAccess: true,
      data: {
        serviceName,
        category: (category || 'other') as any,
        unit: (unit || 'per-event') as any,
        price,
        description: (fd.get('description') as string) || undefined,
      } as any,
    })
    ok = true
  } catch (e: unknown) {
    return { success: false, message: e instanceof Error ? e.message : 'Failed to create service.' }
  }
  if (ok) {
    revalidatePath('/dashboard/services')
    revalidatePath('/dashboard/settings')
    redirect('/dashboard/settings')
  }
  return { success: false, message: 'Unknown error.' }
}

export async function updateService(prev: ActionState, fd: FormData): Promise<ActionState> {
  const id = fd.get('id') as string
  const serviceName = fd.get('serviceName') as string
  const category = fd.get('category') as string
  const unit = fd.get('unit') as string
  const price = Number(fd.get('price'))

  if (!id) return { success: false, message: 'Service ID is required.' }
  if (!serviceName || !price)
    return { success: false, message: 'Service name and price are required.' }

  let ok = false
  try {
    const payload = await getPayload({ config: configPromise })
    await payload.update({
      collection: 'services',
      id,
      overrideAccess: true,
      data: {
        serviceName,
        category: (category || 'other') as any,
        unit: (unit || 'per-event') as any,
        price,
        description: (fd.get('description') as string) || undefined,
      } as any,
    })
    ok = true
  } catch (e: unknown) {
    return { success: false, message: e instanceof Error ? e.message : 'Failed to update service.' }
  }
  if (ok) {
    revalidatePath('/dashboard/services')
    revalidatePath('/dashboard/settings')
    redirect('/dashboard/settings')
  }
  return { success: false, message: 'Unknown error.' }
}
