import React, { Suspense } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SiteHeader } from '@/components/site-header'
import CalendarView, { type CalendarEvent } from '@/components/calendar-view'

export const metadata = {
  title: 'Calendar – Perfect Knot CRM',
}

export default async function CalendarPage() {
  const payload = await getPayload({ config: configPromise })

  let events: CalendarEvent[] = []

  try {
    const res = await payload.find({
      collection: 'leads',
      limit: 500,
      overrideAccess: true,
      depth: 0,
      where: {
        or: [{ checkInDate: { exists: true } }, { checkOutDate: { exists: true } }],
      },
    })

    events = res.docs
      .filter((d: any) => d.checkInDate || d.checkOutDate)
      .map((d: any) => ({
        id: d.id,
        leadId: d.leadId ?? null,
        title: d.fullName ?? 'Unnamed Lead',
        checkInDate: d.checkInDate ?? null,
        checkOutDate: d.checkOutDate ?? null,
        status: d.status ?? 'opportunity',
      }))
  } catch (e) {
    console.error('Calendar fetch error:', e)
  }

  return (
    <>
      <Suspense fallback={<div className="h-12 border-b bg-white" />}>
        <SiteHeader />
      </Suspense>
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 min-h-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Calendar</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your calendar events and teams</p>
          </div>
        </div>
        <div className="flex flex-1 min-h-0" style={{ minHeight: '600px' }}>
          <CalendarView events={events} />
        </div>
      </div>
    </>
  )
}
