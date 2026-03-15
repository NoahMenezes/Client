'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

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

  if (!query) {
    return { leads: [], employees: [], quotations: [] }
  }

  // Execute searches in parallel
  // We use try-catch blocks individually to prevent one failure from blocking others
  const searchLeads = async () => {
    try {
      const res = await payload.find({
        collection: 'leads',
        where: {
          or: [
            { leadId: { like: query } },
            { 'contact.name': { like: query } },
            { 'contact.email': { like: query } },
            { 'contact.phone': { like: query } },
            { status: { like: query } },
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
          or: [{ name: { like: query } }, { email: { like: query } }, { phone: { like: query } }],
        },
        sort: '-createdAt',
        limit: 5,
      })
      return res.docs.map((doc: any) => ({
        id: doc.id,
        type: 'employee' as const,
        title: doc.name,
        subtitle: doc.email,
        link: `/dashboard/employees`, // Assuming list view for now, as detail view might not exist
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
          or: [{ title: { like: query } }, { status: { like: query } }],
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
        link: `/dashboard/quotations`, // Assuming list view
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
