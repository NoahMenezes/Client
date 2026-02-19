'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ActionState = { success: boolean; message: string } | null

export async function createEmployee(prev: ActionState, fd: FormData): Promise<ActionState> {
  const name = fd.get('name') as string
  const email = fd.get('email') as string
  if (!name || !email) return { success: false, message: 'Name and email required.' }

  let ok = false
  try {
    const payload = await getPayload({ config: configPromise })
    await payload.create({
      collection: 'employees',
      overrideAccess: true,
      data: {
        name,
        email,
        phone: (fd.get('phone') as string) || undefined,
        role: (fd.get('role') as string) || undefined,
        department: (fd.get('department') as string) || undefined,
        status: ((fd.get('status') as string) || 'active') as 'active' | 'inactive',
        notes: (fd.get('notes') as string) || undefined,
      },
    })
    ok = true
  } catch (e: unknown) {
    return {
      success: false,
      message: e instanceof Error ? e.message : 'Failed to create employee.',
    }
  }
  if (ok) {
    revalidatePath('/dashboard/employees')
    redirect('/dashboard/employees')
  }
  return { success: false, message: 'Unknown error.' }
}

export async function updateEmployee(prev: ActionState, fd: FormData): Promise<ActionState> {
  const id = fd.get('id') as string
  const name = fd.get('name') as string
  const email = fd.get('email') as string
  if (!id || !name || !email) return { success: false, message: 'Missing required fields.' }

  let ok = false
  try {
    const payload = await getPayload({ config: configPromise })
    await payload.update({
      collection: 'employees',
      id,
      overrideAccess: true,
      data: {
        name,
        email,
        phone: (fd.get('phone') as string) || undefined,
        role: (fd.get('role') as string) || undefined,
        department: (fd.get('department') as string) || undefined,
        status: ((fd.get('status') as string) || 'active') as 'active' | 'inactive',
        notes: (fd.get('notes') as string) || undefined,
      },
    })
    ok = true
  } catch (e: unknown) {
    return {
      success: false,
      message: e instanceof Error ? e.message : 'Failed to update employee.',
    }
  }
  if (ok) {
    revalidatePath('/dashboard/employees')
    redirect('/dashboard/employees')
  }
  return { success: false, message: 'Unknown error.' }
}

export async function deleteEmployee(fd: FormData) {
  const id = fd.get('id') as string
  try {
    const payload = await getPayload({ config: configPromise })
    await payload.delete({ collection: 'employees', id, overrideAccess: true })
  } catch (e) {
    console.error(e)
  }
  revalidatePath('/dashboard/employees')
  redirect('/dashboard/employees')
}
