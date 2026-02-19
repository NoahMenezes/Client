'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  addDays,
  subDays,
  isToday,
  parseISO,
} from 'date-fns'
import Link from 'next/link'

export interface CalendarEvent {
  id: string | number
  leadId: string | null
  title: string
  checkInDate: string | null
  checkOutDate: string | null
  status: string
}

const statusColor: Record<string, string> = {
  opportunity: 'bg-orange-400',
  prospect: 'bg-yellow-400',
  won: 'bg-green-500',
  lost: 'bg-red-400',
  'in-progress': 'bg-blue-500',
}

const statusBadge: Record<string, string> = {
  opportunity: 'bg-orange-100 text-orange-700',
  prospect: 'bg-yellow-100 text-yellow-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
  'in-progress': 'bg-blue-100 text-blue-700',
}

type ViewMode = 'month' | 'week' | 'day'

function getEventsForDay(events: CalendarEvent[], day: Date) {
  return events.filter((e) => {
    const checkIn = e.checkInDate ? parseISO(e.checkInDate) : null
    const checkOut = e.checkOutDate ? parseISO(e.checkOutDate) : null
    if (checkIn && isSameDay(checkIn, day)) return true
    if (checkOut && isSameDay(checkOut, day)) return true
    return false
  })
}

function EventPill({ event, small = false }: { event: CalendarEvent; small?: boolean }) {
  const dot = statusColor[event.status] ?? 'bg-gray-400'
  return (
    <Link href={`/dashboard/leads/${event.id}`}>
      <div
        className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity truncate ${
          small ? 'max-w-[120px]' : 'max-w-full'
        } bg-white border border-gray-200 shadow-sm`}
      >
        <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
        <span className="truncate text-gray-700">{event.title}</span>
      </div>
    </Link>
  )
}

// ── Month View ────────────────────────────────────────────────────────────────
function MonthView({
  current,
  events,
  onSelectDay,
}: {
  current: Date
  events: CalendarEvent[]
  onSelectDay: (d: Date) => void
}) {
  const monthStart = startOfMonth(current)
  const monthEnd = endOfMonth(current)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })
  const weekHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekHeaders.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 auto-rows-fr divide-x divide-y divide-gray-100">
        {days.map((day) => {
          const dayEvents = getEventsForDay(events, day)
          const isCurrentMonth = isSameMonth(day, current)
          const todayDay = isToday(day)
          return (
            <div
              key={day.toISOString()}
              className={`relative min-h-[90px] p-1.5 cursor-pointer hover:bg-gray-50 transition-colors ${
                !isCurrentMonth ? 'bg-gray-50/60' : 'bg-white'
              }`}
              onClick={() => onSelectDay(day)}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  todayDay
                    ? 'bg-primary text-primary-foreground font-bold'
                    : isCurrentMonth
                      ? 'text-gray-800'
                      : 'text-gray-300'
                }`}
              >
                {format(day, 'd')}
              </span>
              <div className="mt-1 flex flex-col gap-0.5">
                {dayEvents.slice(0, 2).map((ev) => (
                  <EventPill key={`${ev.id}-${day.toISOString()}`} event={ev} small />
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-xs text-gray-400 pl-1">+{dayEvents.length - 2} more</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Week View ─────────────────────────────────────────────────────────────────
function WeekView({
  current,
  events,
  onSelectDay,
}: {
  current: Date
  events: CalendarEvent[]
  onSelectDay: (d: Date) => void
}) {
  const weekStart = startOfWeek(current, { weekStartsOn: 0 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="grid grid-cols-7 border-b border-gray-200">
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={`py-3 text-center cursor-pointer hover:bg-gray-50 ${
              isToday(day) ? 'bg-primary/5' : ''
            }`}
            onClick={() => onSelectDay(day)}
          >
            <p className="text-xs font-medium text-gray-400 uppercase">{format(day, 'EEE')}</p>
            <span
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold mt-0.5 ${
                isToday(day) ? 'bg-primary text-primary-foreground' : 'text-gray-700'
              }`}
            >
              {format(day, 'd')}
            </span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 divide-x divide-gray-100">
        {days.map((day) => {
          const dayEvents = getEventsForDay(events, day)
          return (
            <div
              key={day.toISOString()}
              className={`p-2 flex flex-col gap-1 min-h-[200px] cursor-pointer hover:bg-gray-50/60 ${
                isToday(day) ? 'bg-primary/5' : 'bg-white'
              }`}
              onClick={() => onSelectDay(day)}
            >
              {dayEvents.map((ev) => (
                <EventPill key={ev.id} event={ev} />
              ))}
              {dayEvents.length === 0 && (
                <span className="text-xs text-gray-300 mt-2 text-center">—</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Day View ──────────────────────────────────────────────────────────────────
function DayView({ current, events }: { current: Date; events: CalendarEvent[] }) {
  const dayEvents = getEventsForDay(events, current)

  return (
    <div className="flex flex-col flex-1 min-h-0 p-4 gap-3">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${
            isToday(current) ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {format(current, 'd')}
        </span>
        <div>
          <p className="text-base font-semibold text-gray-800">{format(current, 'EEEE')}</p>
          <p className="text-xs text-gray-400">{format(current, 'MMMM yyyy')}</p>
        </div>
      </div>

      {dayEvents.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-gray-400 text-sm">
          No events for this day
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {dayEvents.map((ev) => {
            const checkIn = ev.checkInDate ? parseISO(ev.checkInDate) : null
            const checkOut = ev.checkOutDate ? parseISO(ev.checkOutDate) : null
            return (
              <Link key={ev.id} href={`/dashboard/leads/${ev.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{ev.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {ev.leadId ?? `Lead #${ev.id}`}
                        </p>
                        <div className="flex gap-2 mt-1.5 text-xs text-gray-500">
                          {checkIn && <span>Check-in: {format(checkIn, 'dd MMM yyyy')}</span>}
                          {checkOut && <span>Check-out: {format(checkOut, 'dd MMM yyyy')}</span>}
                        </div>
                      </div>
                      <Badge
                        className={`text-xs capitalize shrink-0 ${
                          statusBadge[ev.status] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {ev.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Side Summary ──────────────────────────────────────────────────────────────
function DaySummary({ day, events }: { day: Date; events: CalendarEvent[] }) {
  const dayEvents = getEventsForDay(events, day)

  return (
    <div className="w-64 shrink-0 border-l border-gray-100 bg-gray-50/60 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Summary for {format(day, 'MMM d')}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
        {dayEvents.length === 0 ? (
          <p className="text-xs text-gray-400 mt-2">
            No events this day. Select a day with events to see a summary.
          </p>
        ) : (
          dayEvents.map((ev) => {
            const checkIn = ev.checkInDate ? parseISO(ev.checkInDate) : null
            const checkOut = ev.checkOutDate ? parseISO(ev.checkOutDate) : null
            const dot = statusColor[ev.status] ?? 'bg-gray-400'
            return (
              <Link key={ev.id} href={`/dashboard/leads/${ev.id}`}>
                <div className="rounded-lg bg-white border border-gray-200 p-2.5 hover:shadow-sm transition-shadow cursor-pointer">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${dot}`} />
                    <p className="text-xs font-semibold text-gray-800 truncate">{ev.title}</p>
                  </div>
                  <p className="text-xs text-gray-400">{ev.leadId ?? `#${ev.id}`}</p>
                  {checkIn && (
                    <p className="text-xs text-gray-500 mt-0.5">In: {format(checkIn, 'dd MMM')}</p>
                  )}
                  {checkOut && (
                    <p className="text-xs text-gray-500">Out: {format(checkOut, 'dd MMM')}</p>
                  )}
                  <Badge
                    className={`mt-1.5 text-xs capitalize ${
                      statusBadge[ev.status] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {ev.status.replace('-', ' ')}
                  </Badge>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function CalendarView({ events }: { events: CalendarEvent[] }) {
  const [current, setCurrent] = React.useState(new Date())
  const [view, setView] = React.useState<ViewMode>('month')
  const [selectedDay, setSelectedDay] = React.useState(new Date())

  function navigate(dir: 1 | -1) {
    if (view === 'month') setCurrent(dir === 1 ? addMonths(current, 1) : subMonths(current, 1))
    else if (view === 'week') setCurrent(dir === 1 ? addWeeks(current, 1) : subWeeks(current, 1))
    else setCurrent(dir === 1 ? addDays(current, 1) : subDays(current, 1))
  }

  function goToday() {
    const today = new Date()
    setCurrent(today)
    setSelectedDay(today)
  }

  function headerLabel() {
    if (view === 'month') return format(current, 'MMMM yyyy')
    if (view === 'week') {
      const ws = startOfWeek(current, { weekStartsOn: 0 })
      const we = endOfWeek(current, { weekStartsOn: 0 })
      return `${format(ws, 'MMM d')} – ${format(we, 'MMM d, yyyy')}`
    }
    return format(current, 'EEEE, MMMM d, yyyy')
  }

  function handleSelectDay(day: Date) {
    setSelectedDay(day)
    setView('day')
    setCurrent(day)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToday} className="text-xs">
            Today
          </Button>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(-1)}>
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(1)}>
              <IconChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-sm font-semibold text-gray-800 min-w-[180px]">{headerLabel()}</h2>
        </div>

        <div className="flex items-center rounded-md border border-gray-200 overflow-hidden text-xs">
          {(['month', 'week', 'day'] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 capitalize font-medium transition-colors ${
                view === v
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex flex-col flex-1 min-h-0 overflow-auto">
          {view === 'month' && (
            <MonthView current={current} events={events} onSelectDay={handleSelectDay} />
          )}
          {view === 'week' && (
            <WeekView current={current} events={events} onSelectDay={handleSelectDay} />
          )}
          {view === 'day' && <DayView current={current} events={events} />}
        </div>

        {/* Side summary — only in month / week */}
        {view !== 'day' && <DaySummary day={selectedDay} events={events} />}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-100 bg-gray-50/60 shrink-0 flex-wrap">
        {Object.entries(statusColor).map(([s, cls]) => (
          <div key={s} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`h-2.5 w-2.5 rounded-full ${cls}`} />
            <span className="capitalize">{s.replace('-', ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
