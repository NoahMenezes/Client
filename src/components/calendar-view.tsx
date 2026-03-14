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

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string | number
  leadId: string | null
  title: string
  date: string                 // the specific date this event instance is for
  type: 'checkIn' | 'checkOut' | 'wedding'
  checkInDate: string | null
  checkOutDate: string | null
  weddingDate: string | null
  status: string
}

// ─── Status colors (matches Leads collection statuses) ────────────────────────

const statusColor: Record<string, string> = {
  new:           'bg-blue-500',
  contacted:     'bg-yellow-400',
  proposal_sent: 'bg-orange-400',
  negotiation:   'bg-purple-500',
  confirmed:     'bg-green-500',
  closed:        'bg-gray-400',
  cancelled:     'bg-red-400',
}

const statusBadge: Record<string, string> = {
  new:           'bg-blue-100 text-blue-700',
  contacted:     'bg-yellow-100 text-yellow-700',
  proposal_sent: 'bg-orange-100 text-orange-700',
  negotiation:   'bg-purple-100 text-purple-700',
  confirmed:     'bg-green-100 text-green-700',
  closed:        'bg-gray-100 text-gray-700',
  cancelled:     'bg-red-100 text-red-700',
}

const statusLabels: Record<string, string> = {
  new:           'New',
  contacted:     'Contacted',
  proposal_sent: 'Proposal Sent',
  negotiation:   'Negotiation',
  confirmed:     'Confirmed',
  closed:        'Closed',
  cancelled:     'Cancelled',
}

// ─── Event type config ────────────────────────────────────────────────────────

const eventTypeConfig = {
  checkIn:  { label: 'Check-in',  bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500', text: 'text-emerald-700', icon: '→' },
  checkOut: { label: 'Check-out', bg: 'bg-rose-50 border-rose-200',       dot: 'bg-rose-500',    text: 'text-rose-700',    icon: '←' },
  wedding:  { label: 'Wedding',   bg: 'bg-violet-50 border-violet-200',   dot: 'bg-violet-500',  text: 'text-violet-700',  icon: '💍' },
}

type ViewMode = 'month' | 'week' | 'day'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getEventsForDay(events: CalendarEvent[], day: Date) {
  return events.filter((e) => {
    try {
      return isSameDay(parseISO(e.date), day)
    } catch {
      return false
    }
  })
}

// ─── Event Pill ───────────────────────────────────────────────────────────────

function EventPill({ event, small = false }: { event: CalendarEvent; small?: boolean }) {
  const cfg = eventTypeConfig[event.type]
  return (
    <Link href={`/dashboard/leads/${event.id}`}>
      <div
        className={`flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${
          small ? 'max-w-[130px]' : 'max-w-full'
        } ${cfg.bg} shadow-sm`}
      >
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`} />
        <span className={`shrink-0 ${cfg.text}`}>{cfg.icon}</span>
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
                {dayEvents.slice(0, 2).map((ev, i) => (
                  <EventPill key={`${ev.id}-${ev.type}-${i}`} event={ev} small />
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
              {dayEvents.map((ev, i) => (
                <EventPill key={`${ev.id}-${ev.type}-${i}`} event={ev} />
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
          {dayEvents.map((ev, i) => {
            const cfg = eventTypeConfig[ev.type]
            const checkIn = ev.checkInDate ? parseISO(ev.checkInDate) : null
            const checkOut = ev.checkOutDate ? parseISO(ev.checkOutDate) : null
            const wedding = ev.weddingDate ? parseISO(ev.weddingDate) : null
            return (
              <Link key={`${ev.id}-${ev.type}-${i}`} href={`/dashboard/leads/${ev.id}`}>
                <Card className={`hover:shadow-md transition-shadow cursor-pointer border ${cfg.bg}`}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.text}`}>
                            {cfg.icon} {cfg.label}
                          </span>
                        </div>
                        <p className="font-semibold text-sm text-gray-900">{ev.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {ev.leadId ?? `Lead #${ev.id}`}
                        </p>
                        <div className="flex flex-wrap gap-x-3 mt-1.5 text-xs text-gray-500">
                          {checkIn && <span>Check-in: {format(checkIn, 'dd MMM yyyy')}</span>}
                          {checkOut && <span>Check-out: {format(checkOut, 'dd MMM yyyy')}</span>}
                          {wedding && <span>💍 Wedding: {format(wedding, 'dd MMM yyyy')}</span>}
                        </div>
                      </div>
                      <Badge
                        className={`text-xs capitalize shrink-0 ${
                          statusBadge[ev.status] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {statusLabels[ev.status] ?? ev.status}
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
          {format(day, 'MMM d')} — {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
        {dayEvents.length === 0 ? (
          <p className="text-xs text-gray-400 mt-2">
            No events this day. Select a day with events to see a summary.
          </p>
        ) : (
          dayEvents.map((ev, i) => {
            const cfg = eventTypeConfig[ev.type]
            const checkIn = ev.checkInDate ? parseISO(ev.checkInDate) : null
            const checkOut = ev.checkOutDate ? parseISO(ev.checkOutDate) : null
            const wedding = ev.weddingDate ? parseISO(ev.weddingDate) : null
            return (
              <Link key={`${ev.id}-${ev.type}-${i}`} href={`/dashboard/leads/${ev.id}`}>
                <div className={`rounded-lg border p-2.5 hover:shadow-sm transition-shadow cursor-pointer ${cfg.bg}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${cfg.dot}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.text}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-800 truncate">{ev.title}</p>
                  <p className="text-xs text-gray-400">{ev.leadId ?? `#${ev.id}`}</p>
                  {checkIn && (
                    <p className="text-xs text-gray-500 mt-0.5">In: {format(checkIn, 'dd MMM')}</p>
                  )}
                  {checkOut && (
                    <p className="text-xs text-gray-500">Out: {format(checkOut, 'dd MMM')}</p>
                  )}
                  {wedding && (
                    <p className="text-xs text-gray-500">💍 {format(wedding, 'dd MMM')}</p>
                  )}
                  <Badge
                    className={`mt-1.5 text-xs capitalize ${
                      statusBadge[ev.status] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {statusLabels[ev.status] ?? ev.status}
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
      <div className="flex items-center gap-6 px-4 py-2.5 border-t border-gray-100 bg-gray-50/60 shrink-0 flex-wrap">
        {Object.entries(eventTypeConfig).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
            <span>{cfg.icon} {cfg.label}</span>
          </div>
        ))}
        <span className="text-gray-300 mx-1">|</span>
        {Object.entries(statusColor).map(([s, cls]) => (
          <div key={s} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`h-2 w-2 rounded-full ${cls}`} />
            <span className="capitalize">{statusLabels[s] ?? s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
