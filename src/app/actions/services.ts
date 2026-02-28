'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ActionState = { success: boolean; message: string } | null

export async function createService(prev: ActionState, fd: FormData): Promise<ActionState> {
  const serviceName = fd.get('serviceName') as string
  const category = fd.get('category') as string
  const price = Number(fd.get('price'))

  if (!serviceName || !price)
    return { success: false, message: 'Service name and price are required.' }

  let ok = false
  try {
    const payload = await getPayload({ config: configPromise })

    // category field is a relationship to 'service-categories'
    // If a numeric ID is provided, use it directly; otherwise try to find or create the category
    let categoryId: number | undefined
    if (category && category.trim() !== '') {
      const parsed = Number(category)
      if (!isNaN(parsed) && parsed > 0) {
        categoryId = parsed
      } else {
        // Try to find by name
        const found = await payload.find({
          collection: 'service-categories',
          where: { name: { equals: category.trim() } },
          limit: 1,
          overrideAccess: true,
        })
        if (found.totalDocs > 0) {
          categoryId = found.docs[0].id
        } else {
          // Create the category
          const created = await payload.create({
            collection: 'service-categories',
            overrideAccess: true,
            data: { name: category.trim() },
          })
          categoryId = created.id
        }
      }
    }

    await payload.create({
      collection: 'services',
      overrideAccess: true,
      data: {
        name: serviceName,
        ...(categoryId ? { category: categoryId } : {}),
        base_price: price,
        description: (fd.get('description') as string) || undefined,
        is_active: true,
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
  const price = Number(fd.get('price'))

  if (!id) return { success: false, message: 'Service ID is required.' }
  if (!serviceName || !price)
    return { success: false, message: 'Service name and price are required.' }

  let ok = false
  try {
    const payload = await getPayload({ config: configPromise })

    // Resolve category relationship
    let categoryId: number | undefined
    if (category && category.trim() !== '') {
      const parsed = Number(category)
      if (!isNaN(parsed) && parsed > 0) {
        categoryId = parsed
      } else {
        const found = await payload.find({
          collection: 'service-categories',
          where: { name: { equals: category.trim() } },
          limit: 1,
          overrideAccess: true,
        })
        if (found.totalDocs > 0) {
          categoryId = found.docs[0].id
        } else {
          const created = await payload.create({
            collection: 'service-categories',
            overrideAccess: true,
            data: { name: category.trim() },
          })
          categoryId = created.id
        }
      }
    }

    await payload.update({
      collection: 'services',
      id,
      overrideAccess: true,
      data: {
        name: serviceName,
        ...(categoryId ? { category: categoryId } : {}),
        base_price: price,
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
