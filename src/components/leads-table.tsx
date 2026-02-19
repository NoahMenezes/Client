"use client"

import React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteLead } from "@/app/actions/leads"

interface Lead {
  id: number | string
  leadId?: string | null
  fullName: string
  email: string
  phone?: string | null
  status: string
  checkInDate?: string | null
  checkOutDate?: string | null
}

const statusStyles: Record<string, string> = {
  opportunity: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  prospect: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  won: "bg-green-100 text-green-700 hover:bg-green-100",
  lost: "bg-red-100 text-red-700 hover:bg-red-100",
  "in-progress": "bg-blue-100 text-blue-700 hover:bg-blue-100",
}

const statusLabels: Record<string, string> = {
  opportunity: "Opportunity",
  prospect: "Prospect",
  won: "Won",
  lost: "Lost",
  "in-progress": "In Progress",
}

export function LeadsTable({ leads, totalDocs }: { leads: Lead[]; totalDocs: number }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold">Recent Leads</CardTitle>
        <Link href="/dashboard/leads/add">
          <Button size="sm" className="bg-[#1a2744] text-white hover:bg-[#243460]">+ Add Lead</Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {leads.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No leads yet. Click &quot;+ Add Lead&quot; to create your first lead.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1a2744] text-white text-xs uppercase">
                  <th className="px-4 py-3 text-left font-medium">Lead ID</th>
                  <th className="px-4 py-3 text-left font-medium">Client Name</th>
                  <th className="px-4 py-3 text-left font-medium">Contact</th>
                  <th className="px-4 py-3 text-left font-medium">Check-In</th>
                  <th className="px-4 py-3 text-left font-medium">Check-Out</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr key={String(lead.id)} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 font-medium">{lead.leadId ? `#${lead.leadId}` : `#${lead.id}`}</td>
                    <td className="px-4 py-3">{lead.fullName}</td>
                    <td className="px-4 py-3 text-xs">
                      {lead.email}
                      {lead.phone && <><br />{lead.phone}</>}
                    </td>
                    <td className="px-4 py-3">{lead.checkInDate || '—'}</td>
                    <td className="px-4 py-3">{lead.checkOutDate || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge className={statusStyles[lead.status] || ''}>{statusLabels[lead.status] || lead.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/leads/${lead.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 px-3 text-xs">View</Button>
                        </Link>
                        <Link href={`/dashboard/leads/${lead.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-7 px-3 text-xs">Edit</Button>
                        </Link>
                        <form action={deleteLead}>
                          <input type="hidden" name="id" value={String(lead.id)} />
                          <Button type="submit" variant="destructive" size="sm" className="h-7 px-3 text-xs">Delete</Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
          <span>Showing <strong>{leads.length}</strong> of <strong>{totalDocs}</strong></span>
        </div>
      </CardContent>
    </Card>
  )
}
