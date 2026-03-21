import React, { Suspense } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SiteHeader } from '@/components/site-header'
import CalendarView, { type CalendarEvent } from '@/components/calendar-view'
import { getCurrentUser } from '@/app/actions/auth'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const payload = await getPayload({ config: configPromise })
  const currentUser = await getCurrentUser()

  let events: CalendarEvent[] = []
  try {
    const res = await payload.find({
      collection: 'leads',
      limit: 1000,
      depth: 1,
      sort: '-createdAt',
      overrideAccess: true,
      where: currentUser ? { createdBy: { equals: currentUser.id } } : {},
    })

    events = res.docs
      .map((lead: any) => {
        if (!lead.checkInDate || !lead.checkOutDate) return null

        const name = lead.contact?.name ?? 'Unknown'
        const leadId = lead.leadId ?? null
        const status = lead.status ?? 'opportunity'
        const id = lead.id

        if (['no_response', 'disqualified', 'lost_prospect'].includes(status)) {
           return null
        }

        return {
          id,
          leadId,
          title: name,
          start: lead.checkInDate,
          end: lead.checkOutDate,
          weddingDate: lead.weddingDate ?? null,
          status,
        }
      })
      .filter(Boolean) as CalendarEvent[]
  } catch (error) {
    console.error('Error fetching leads for calendar:', error)
  }

  return (
    <>
      <Suspense fallback={<div className="h-12 border-b bg-white" />}>
        <SiteHeader title="Calendar" />
      </Suspense>
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 min-h-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Calendar</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Wedding dates, check-ins &amp; check-outs for your leads
            </p>
          </div>
        </div>
        <div className="flex flex-1 min-h-0" style={{ minHeight: '600px' }}>
          <CalendarView events={events} />
        </div>
      </div>
    </>
  )
}
