import React, { Suspense } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SiteHeader } from '@/components/site-header'
import { Folder } from 'lucide-react'
import { StorageGrid } from '@/components/storage-grid'

export default async function StoragePage() {
  let leads: any[] = []
  const quotesByLead: Record<string, any[]> = {}

  try {
    const payload = await getPayload({ config: configPromise })
    
    // Fetch leads and quotations in parallel
    const [leadsRes, quotesRes] = await Promise.all([
      payload.find({
        collection: 'leads',
        limit: 100,
        sort: '-createdAt',
        overrideAccess: true,
        depth: 1,
      }),
      payload.find({
        collection: 'quotations',
        limit: 1000,
        overrideAccess: true,
        depth: 0,
        sort: '-createdAt',
      })
    ])

    leads = leadsRes.docs
    
    // Group quotations by lead ID
    quotesRes.docs.forEach((q: any) => {
      const leadId = typeof q.lead === 'object' ? q.lead.id : q.lead
      if (!quotesByLead[leadId]) {
        quotesByLead[leadId] = []
      }
      quotesByLead[leadId].push(q)
    })
  } catch (e) {
    console.error('Storage fetch error:', e)
  }

  return (
    <div className="flex flex-1 flex-col bg-gray-50/30">
      <Suspense fallback={<div className="h-12 border-b bg-white" />}>
        <SiteHeader title="Archive Storage" />
      </Suspense>

      <main className="flex-1 overflow-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Header Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Project Archive</h1>
              <p className="text-gray-500 mt-1">Manage and explore all leads and their associated quotations in a structured directory.</p>
            </div>
          </div>

          {/* The Main Grid Component */}
          {leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="bg-gray-100 p-6 rounded-full mb-4">
                <Folder className="size-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No project archives found</h3>
              <p className="text-gray-500 max-w-xs mx-auto mt-2">
                Leads and quotations will automatically appear here once they are created in the system.
              </p>
            </div>
          ) : (
            <StorageGrid leads={leads} quotesByLead={quotesByLead} />
          )}
        </div>
      </main>
    </div>
  )
}
