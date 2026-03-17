'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getCurrentUser } from '@/app/actions/auth'

export type SearchResult = {
  id: string
  type: 'lead' | 'employee' | 'quotation'
  title: string
  subtitle?: string
  status?: string
  link: string
  data?: any
}

export async function searchGlobal(query: string): Promise<{
  leads: SearchResult[]
  employees: SearchResult[]
  quotations: SearchResult[]
}> {
  const payload = await getPayload({ config: configPromise })
  const currentUser = await getCurrentUser()

  if (!query || !currentUser) {
    return { leads: [], employees: [], quotations: [] }
  }

  // Execute searches in parallel
  const searchLeads = async () => {
    try {
      const res = await payload.find({
        collection: 'leads',
        where: {
          and: [
            { createdBy: { equals: currentUser.id } },
            {
              or: [
                { leadId: { like: query } },
                { 'contact.name': { like: query } },
                { 'contact.email': { like: query } },
                { 'contact.phone': { like: query } },
                { status: { like: query } },
              ],
            },
          ],
        },
        sort: '-createdAt',
        limit: 5,
        depth: 1,
      })
      return res.docs.map((doc: any) => ({
        id: doc.id,
        type: 'lead' as const,
        title: doc.contact?.name || 'Unknown Lead',
        subtitle: doc.leadId ? `ID: ${doc.leadId}` : undefined,
        status: doc.status,
        link: `/dashboard/leads/${doc.id}`,
        data: {
          phone: doc.contact?.phone,
          checkIn: doc.checkInDate,
          checkOut: doc.checkOutDate,
        },
      }))
    } catch (e) {
      console.error('Error searching leads:', e)
      return []
    }
  }

  const searchEmployees = async () => {
    try {
      const res = await payload.find({
        collection: 'employees',
        where: {
          and: [
            { createdBy: { equals: currentUser.id } },
            {
              or: [
                { name: { like: query } },
                { email: { like: query } },
                { phone: { like: query } },
              ],
            },
          ],
        },
        sort: '-createdAt',
        limit: 5,
      })
      return res.docs.map((doc: any) => ({
        id: doc.id,
        type: 'employee' as const,
        title: doc.name,
        subtitle: doc.email,
        link: `/dashboard/employees`,
      }))
    } catch (e) {
      console.error('Error searching employees:', e)
      return []
    }
  }

  const searchQuotations = async () => {
    try {
      const res = await payload.find({
        collection: 'quotations',
        where: {
          and: [
            { createdBy: { equals: currentUser.id } },
            {
              or: [{ title: { like: query } }, { status: { like: query } }],
            },
          ],
        },
        sort: '-createdAt',
        limit: 5,
      })
      return res.docs.map((doc: any) => ({
        id: doc.id,
        type: 'quotation' as const,
        title: doc.title || 'Untitled Quotation',
        subtitle: doc.grandTotal ? `Total: ${doc.grandTotal}` : undefined,
        status: doc.status,
        link: `/dashboard/quotations`,
      }))
    } catch (e) {
      console.error('Error searching quotations:', e)
      return []
    }
  }

  const [leads, employees, quotations] = await Promise.all([
    searchLeads(),
    searchEmployees(),
    searchQuotations(),
  ])

  return { leads, employees, quotations }
}
