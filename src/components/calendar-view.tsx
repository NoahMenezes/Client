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
  isBefore,
  isAfter,
  differenceInDays,
  isSameDay,
  max,
  min,
} from 'date-fns'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string | number
  leadId: string | null
  title: string
  start: string
  end: string
  weddingDate: string | null
  status: string
}

// ─── Per-lead color palette (rich, distinct colors like image 2) ──────────────

const LEAD_COLORS = [
  { bg: '#3b5bdb', text: '#ffffff' }, // indigo
  { bg: '#1098ad', text: '#ffffff' }, // teal
  { bg: '#7048e8', text: '#ffffff' }, // violet
  { bg: '#c2255c', text: '#ffffff' }, // pink
  { bg: '#2f9e44', text: '#ffffff' }, // green
  { bg: '#e8590c', text: '#ffffff' }, // orange
  { bg: '#5c7cfa', text: '#ffffff' }, // blue
  { bg: '#a61e4d', text: '#ffffff' }, // dark pink
  { bg: '#0c8599', text: '#ffffff' }, // cyan
  { bg: '#862e9c', text: '#ffffff' }, // purple
  { bg: '#5f3dc4', text: '#ffffff' }, // deep violet
  { bg: '#087f5b', text: '#ffffff' }, // dark teal
]

/** Assign a stable color to each event by its id. */
function getLeadColor(eventId: string | number): { bg: string; text: string } {
  const ids = String(eventId)
  let hash = 0
  for (let i = 0; i < ids.length; i++) {
    hash = (hash * 31 + ids.charCodeAt(i)) & 0xffffffff
  }
  return LEAD_COLORS[Math.abs(hash) % LEAD_COLORS.length]
}

// ─── Status info (for legend + detail badges only) ────────────────────────────

const statusBadge: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  proposal_sent: 'bg-orange-100 text-orange-700',
  negotiation: 'bg-purple-100 text-purple-700',
  confirmed: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
}

const statusLabels: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  proposal_sent: 'Proposal Sent',
  negotiation: 'Negotiation',
  confirmed: 'Confirmed',
  closed: 'Closed',
  cancelled: 'Cancelled',
}

type ViewMode = 'month' | 'week' | 'day'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getEventsForDay(events: CalendarEvent[], day: Date) {
  return events.filter((e) => {
    try {
      const start = parseISO(e.start)
      const end = parseISO(e.end)
      return !isBefore(day, start) && !isAfter(day, end)
    } catch {
      return false
    }
  })
}

// ─── Month Event Bar ──────────────────────────────────────────────────────────
// Shows name only on the FIRST day of the range, coloured bar on subsequent days

const MAX_SLOTS = 3 // max visible event rows per day cell

function MonthEventBar({ event, day }: { event: CalendarEvent; day: Date }) {
  const color = getLeadColor(event.id)
  const isFirst = isSameDay(day, parseISO(event.start))

  return (
    <Link href={`/dashboard/leads/${event.id}`} onClick={(e) => e.stopPropagation()}>
      <div
        className="flex items-center rounded-sm overflow-hidden text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
        style={{
          backgroundColor: color.bg,
          color: color.text,
          height: '18px',
          paddingLeft: '4px',
          paddingRight: '4px',
        }}
        title={event.title}
      >
        {isFirst ? (
          <span className="truncate leading-none">{event.title}</span>
        ) : (
          <span className="opacity-0 select-none leading-none text-[1px]">·</span>
        )}
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

  const visibleEvents = events
    .filter((e) => {
      try {
        const start = parseISO(e.start)
        const end = parseISO(e.end)
        return !isAfter(start, calEnd) && !isBefore(end, calStart)
      } catch {
        return false
      }
    })
    .sort((a, b) => {
      const aStart = parseISO(a.start).getTime()
      const bStart = parseISO(b.start).getTime()
      if (aStart !== bStart) return aStart - bStart
      const aLen = parseISO(a.end).getTime() - aStart
      const bLen = parseISO(b.end).getTime() - bStart
      return bLen - aLen
    })

  const slotMap = new Map<string | number, number>()
  const slotEnds = new Map<number, number>()
  visibleEvents.forEach((ev) => {
    const start = parseISO(ev.start).getTime()
    const end = parseISO(ev.end).getTime()
    let slot = 0
    while (true) {
      const currentEnd = slotEnds.get(slot)
      if (currentEnd === undefined || currentEnd < start) {
        break
      }
      slot++
    }
    slotMap.set(ev.id, slot)
    slotEnds.set(slot, end)
  })

  const maxSlot = Math.max(-1, ...Array.from(slotMap.values()))
  const renderSlots = Math.min(maxSlot + 1, MAX_SLOTS)

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
          const isCurrentMonth = isSameMonth(day, current)
          const todayDay = isToday(day)

          // The events active on this day, keyed by their fixed slot
          const activeBySlot = new Map<number, CalendarEvent>()
          visibleEvents.forEach((ev) => {
            try {
              const start = parseISO(ev.start)
              const end = parseISO(ev.end)
              if (!isBefore(day, start) && !isAfter(day, end)) {
                const slot = slotMap.get(ev.id)!
                activeBySlot.set(slot, ev)
              }
            } catch {}
          })

          // Count overflow events (slot >= MAX_SLOTS and active today)
          const overflow = visibleEvents.filter((ev) => {
            const slot = slotMap.get(ev.id)!
            if (slot < MAX_SLOTS) return false
            try {
              return !isBefore(day, parseISO(ev.start)) && !isAfter(day, parseISO(ev.end))
            } catch {
              return false
            }
          }).length

          return (
            <div
              key={day.toISOString()}
              className={`relative min-h-24 p-1 cursor-pointer hover:bg-gray-50 transition-colors ${
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
              <div className="mt-0.5 flex flex-col gap-0.5">
                {Array.from({ length: renderSlots }, (_, slot) => {
                  const ev = activeBySlot.get(slot)
                  return ev ? (
                    <MonthEventBar key={ev.id} event={ev} day={day} />
                  ) : (
                    // Transparent spacer — keeps the slot row reserved
                    <div key={`empty-${slot}`} className="h-[18px] shrink-0 pointer-events-none" />
                  )
                })}
                {overflow > 0 && (
                  <span className="text-[10px] text-gray-400 pl-1">+{overflow} more</span>
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
  const weekEnd = endOfWeek(current, { weekStartsOn: 0 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const weekEvents = events
    .filter((e) => {
      try {
        const start = parseISO(e.start)
        const end = parseISO(e.end)
        return !isBefore(end, weekStart) && !isAfter(start, weekEnd)
      } catch {
        return false
      }
    })
    .sort((a, b) => {
      const aStart = parseISO(a.start).getTime()
      const bStart = parseISO(b.start).getTime()
      if (aStart !== bStart) return aStart - bStart
      const aLen = parseISO(a.end).getTime() - aStart
      const bLen = parseISO(b.end).getTime() - bStart
      return bLen - aLen
    })

  const slotMap = new Map<string | number, number>()
  const slotEnds = new Map<number, number>()
  weekEvents.forEach((ev) => {
    const start = parseISO(ev.start).getTime()
    const end = parseISO(ev.end).getTime()
    let slot = 0
    while (true) {
      const currentEnd = slotEnds.get(slot)
      if (currentEnd === undefined || currentEnd < start) {
        break
      }
      slot++
    }
    slotMap.set(ev.id, slot)
    slotEnds.set(slot, end)
  })

  const maxSlot = Math.max(-1, ...Array.from(slotMap.values()))
  const totalSlots = maxSlot + 1

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
      {/* Spanning event bars */}
      <div
        className="relative border-b border-gray-200"
        style={{ minHeight: `${totalSlots * 26 + 12}px` }}
      >
        {weekEvents.map((event) => {
          const slot = slotMap.get(event.id)!
          const start = parseISO(event.start)
          const end = parseISO(event.end)
          const eventStart = max([start, weekStart])
          const eventEnd = min([end, weekEnd])
          const startCol = differenceInDays(eventStart, weekStart)
          const span = differenceInDays(eventEnd, eventStart) + 1
          const left = (startCol / 7) * 100 + '%'
          const width = (span / 7) * 100 + '%'
          const color = getLeadColor(event.id)
          const isFirst = isSameDay(eventStart, start)

          return (
            <Link key={event.id} href={`/dashboard/leads/${event.id}`}>
              <div
                className="absolute flex items-center px-2 text-xs font-medium rounded cursor-pointer hover:opacity-80 transition-opacity truncate"
                style={{
                  left,
                  width,
                  top: `${slot * 26 + 8}px`,
                  height: '20px',
                  backgroundColor: color.bg,
                  color: color.text,
                }}
                title={event.title}
              >
                {isFirst ? event.title : ''}
              </div>
            </Link>
          )
        })}
      </div>
      <div className="grid grid-cols-7 flex-1 divide-x divide-gray-100">
        {days.map((day) => {
          const dayEvents = getEventsForDay(events, day)
          return (
            <div
              key={day.toISOString()}
              className={`p-2 flex flex-col gap-1 min-h-40 cursor-pointer hover:bg-gray-50/60 ${
                isToday(day) ? 'bg-primary/5' : 'bg-white'
              }`}
              onClick={() => onSelectDay(day)}
            >
              {dayEvents.map((ev) => (
                <MonthEventBar key={ev.id} event={ev} day={day} />
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
            const checkIn = parseISO(ev.start)
            const checkOut = parseISO(ev.end)
            const wedding = ev.weddingDate ? parseISO(ev.weddingDate) : null
            const color = getLeadColor(ev.id)
            return (
              <Link key={ev.id} href={`/dashboard/leads/${ev.id}`}>
                <Card
                  className="hover:shadow-md transition-shadow cursor-pointer border-0 overflow-hidden"
                  style={{ borderLeft: `4px solid ${color.bg}` }}
                >
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{ev.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {ev.leadId ?? `Lead #${ev.id}`}
                        </p>
                        <div className="flex flex-wrap gap-x-3 mt-1.5 text-xs text-gray-500">
                          <span>Check-in: {format(checkIn, 'dd MMM yyyy')}</span>
                          <span>Check-out: {format(checkOut, 'dd MMM yyyy')}</span>
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
          dayEvents.map((ev) => {
            const checkIn = parseISO(ev.start)
            const checkOut = parseISO(ev.end)
            const wedding = ev.weddingDate ? parseISO(ev.weddingDate) : null
            const color = getLeadColor(ev.id)
            return (
              <Link key={ev.id} href={`/dashboard/leads/${ev.id}`}>
                <div
                  className="rounded-lg p-2.5 hover:shadow-sm transition-shadow cursor-pointer border-l-4 bg-white border border-gray-100"
                  style={{ borderLeftColor: color.bg }}
                >
                  <p className="text-xs font-semibold text-gray-800 truncate">{ev.title}</p>
                  <p className="text-xs text-gray-400">{ev.leadId ?? `#${ev.id}`}</p>
                  <p className="text-xs text-gray-500 mt-0.5">In: {format(checkIn, 'dd MMM')}</p>
                  <p className="text-xs text-gray-500">Out: {format(checkOut, 'dd MMM')}</p>
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
          <h2 className="text-sm font-semibold text-gray-800 min-w-45">{headerLabel()}</h2>
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

      {/* Legend – show unique leads with their colors */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-100 bg-gray-50/60 shrink-0 flex-wrap">
        <span className="text-xs text-gray-400 font-medium mr-1">Leads:</span>
        {events.slice(0, 8).map((ev) => {
          const color = getLeadColor(ev.id)
          return (
            <div key={ev.id} className="flex items-center gap-1.5 text-xs text-gray-600">
              <span
                className="h-2.5 w-2.5 rounded-sm flex-shrink-0"
                style={{ backgroundColor: color.bg }}
              />
              <span className="truncate max-w-28">{ev.title}</span>
            </div>
          )
        })}
        {events.length > 8 && (
          <span className="text-xs text-gray-400">+{events.length - 8} more</span>
        )}
      </div>
    </div>
  )
}
