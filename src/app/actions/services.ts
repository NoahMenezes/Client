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
        category: (category || 'other') as
          | 'catering'
          | 'photography'
          | 'other'
          | 'coordination'
          | 'decor'
          | 'entertainment',
        unit: (unit || 'per-event') as
          | 'per-event'
          | 'per-plate'
          | 'per-hour'
          | 'package'
          | 'per-unit',
        price,
        description: (fd.get('description') as string) || undefined,
      },
    })
    ok = true
  } catch (e: unknown) {
    return { success: false, message: e instanceof Error ? e.message : 'Failed to create service.' }
  }
  if (ok) {
    revalidatePath('/dashboard/services')
    redirect('/dashboard/services')
  }
  return { success: false, message: 'Unknown error.' }
}
