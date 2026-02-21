import React, { Suspense } from 'react'
import { SiteHeader } from '@/components/site-header'
import CalendarView, { type CalendarEvent } from '@/components/calendar-view'

export default function CalendarPage() {
  const events: CalendarEvent[] = []
  return (
    <>
      <Suspense fallback={<div className="h-12 border-b bg-white" />}>
        <SiteHeader title="Calendar" />
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
