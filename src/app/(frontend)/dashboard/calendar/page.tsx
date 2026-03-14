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

  const res = await payload.find({
    collection: 'leads',
    limit: 1000,
    depth: 1,
    sort: '-createdAt',
    overrideAccess: true,
    where: currentUser ? { createdBy: { equals: currentUser.id } } : {},
  })

  const events: CalendarEvent[] = res.docs.flatMap((lead: any) => {
    const name = lead.contact?.name ?? 'Unknown'
    const leadId = lead.leadId ?? null
    const status = lead.status ?? 'new'
    const id = lead.id

    const evts: CalendarEvent[] = []

    if (lead.checkInDate) {
      evts.push({
        id,
        leadId,
        title: name,
        date: lead.checkInDate,
        type: 'checkIn',
        checkInDate: lead.checkInDate,
        checkOutDate: lead.checkOutDate ?? null,
        weddingDate: lead.weddingDate ?? null,
        status,
      })
    }

    if (lead.checkOutDate) {
      evts.push({
        id,
        leadId,
        title: name,
        date: lead.checkOutDate,
        type: 'checkOut',
        checkInDate: lead.checkInDate ?? null,
        checkOutDate: lead.checkOutDate,
        weddingDate: lead.weddingDate ?? null,
        status,
      })
    }

    if (lead.weddingDate) {
      evts.push({
        id,
        leadId,
        title: name,
        date: lead.weddingDate,
        type: 'wedding',
        checkInDate: lead.checkInDate ?? null,
        checkOutDate: lead.checkOutDate ?? null,
        weddingDate: lead.weddingDate,
        status,
      })
    }

    return evts
  })

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
