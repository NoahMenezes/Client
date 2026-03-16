'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Folder, 
  FileText, 
  Search, 
  ChevronRight,
  ExternalLink,
  History,
  FileBadge
} from 'lucide-react'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

const statusStyles: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  contacted: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  proposal_sent: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
  negotiation: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
  confirmed: 'bg-green-100 text-green-700 hover:bg-green-100',
  closed: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  cancelled: 'bg-red-100 text-red-700 hover:bg-red-100',
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


export function StorageGrid({ 
  leads, 
  quotesByLead 
}: { 
  leads: any[], 
  quotesByLead: Record<string, any[]> 
}) {
  const [selectedLeadId, setSelectedLeadId] = useState<string | number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedLead = leads.find(l => l.id === selectedLeadId)
  const selectedQuotes = selectedLeadId ? (quotesByLead[selectedLeadId] || []) : []

  const filteredLeads = leads.filter(lead => {
    const fullName = typeof lead.contact === 'object' ? lead.contact.name : lead.fullName || 'Unknown'
    return fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (lead.leadId && lead.leadId.toLowerCase().includes(searchQuery.toLowerCase()))
  })

  return (
    <div className="space-y-8">
      {/* Filters/Search Row */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search archive folders..." 
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeads.map((lead: any) => {
          const quotes = quotesByLead[lead.id] || []
          const fullName = typeof lead.contact === 'object' ? lead.contact.name : lead.fullName || 'Unknown'
          const leadDisplayId = lead.leadId || `PK-${lead.id}`

          return (
            <Card 
              key={lead.id} 
              onClick={() => setSelectedLeadId(lead.id)}
              className="group cursor-pointer hover:shadow-xl hover:border-blue-200 transition-all duration-300 border-gray-200 overflow-hidden bg-white relative"
            >
              <CardHeader className="bg-gray-50/50 group-hover:bg-blue-50/30 transition-colors border-b pb-5">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 bg-blue-100/50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <Folder className="size-5" />
                  </div>
                  <Badge className={`text-[10px] px-2 py-0 font-medium ${statusStyles[lead.status] || 'bg-gray-100'}`}>
                    {statusLabels[lead.status] || lead.status}
                  </Badge>
                </div>
                <div className="mt-4">
                  <CardTitle className="text-lg font-bold group-hover:text-blue-600 transition-colors truncate">{fullName}</CardTitle>
                  <CardDescription className="text-[11px] font-mono uppercase tracking-widest mt-1 text-gray-400 group-hover:text-blue-400 transition-colors">
                    {leadDisplayId}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardFooter className="py-4 bg-white flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <FileText className="size-3.5" />
                  <span className="text-[11px] font-semibold">{quotes.length} Items</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[11px]">Open Folder</span>
                  <ChevronRight className="size-3.5" />
                </div>
              </CardFooter>
              
              {/* Subtle hover overlay for depth */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/10 pointer-events-none rounded-xl" />
            </Card>
          )
        })}
      </div>

      {/* Empty State for results */}
      {filteredLeads.length === 0 && (
        <div className="py-20 text-center">
          <div className="bg-gray-50 p-6 rounded-full inline-block mb-4">
            <Search className="size-10 text-gray-300" />
          </div>
          <h3 className="text-gray-900 font-semibold">No matches found</h3>
          <p className="text-gray-500 text-sm mt-1">Try searching for a different name or project ID.</p>
        </div>
      )}

      {/* Folder Detail Dialog */}
      <Dialog open={selectedLeadId !== null} onOpenChange={() => setSelectedLeadId(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl sm:rounded-2xl border-none shadow-2xl">
          <div className="bg-blue-600 p-6 text-white relative">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg">
                  <Folder className="size-5 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-none hover:bg-white/30 text-[10px]">Project Directory</Badge>
             </div>
             <DialogTitle className="text-2xl font-black tracking-tight leading-none mb-1">
               {selectedLead ? (typeof selectedLead.contact === 'object' ? selectedLead.contact.name : selectedLead.fullName) : ''}
             </DialogTitle>
             <DialogDescription className="text-blue-100 text-xs font-mono tracking-widest uppercase flex items-center gap-2">
               {selectedLead?.leadId || `PK-${selectedLead?.id}`}
               <span className="opacity-30">•</span>
               {selectedQuotes.length} Total Quotations
             </DialogDescription>
             
             {/* Decorative Background Icon */}
             <Folder className="absolute -bottom-6 -right-6 size-32 text-white opacity-5 rotate-12 pointer-events-none" />
          </div>

          <div className="p-6 bg-white min-h-[400px]">
             <div className="flex items-center justify-between mb-6">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <History className="size-3.5" />
                  Files Overview
                </h4>
                <Link href={`/dashboard/leads/${selectedLead?.id}`} className="text-blue-600 text-[11px] font-bold hover:underline flex items-center gap-1">
                  View Full Profile
                  <ExternalLink className="size-3" />
                </Link>
             </div>

             {selectedQuotes.length > 0 ? (
               <div className="grid grid-cols-1 gap-2.5">
                 {selectedQuotes.map((q: any) => (
                   <Link 
                     key={q.id} 
                     href={`/dashboard/quotations/${q.id}`}
                     className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group/file"
                   >
                     <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-50 rounded-lg group-hover/file:bg-blue-500 group-hover/file:text-white transition-all">
                          <FileText className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-none mb-1 group-hover/file:text-blue-700 transition-colors">{q.title}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 rounded group-hover/file:border-blue-200 group-hover/file:bg-white transition-all">
                              {q.status || 'Draft'}
                            </Badge>
                            <span className="text-[10px] text-gray-400">Created {new Date(q.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[13px] font-black text-gray-900">₹{(q.grandTotal || 0).toLocaleString('en-IN')}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Amount</p>
                     </div>
                   </Link>
                 ))}
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                    <FileBadge className="size-8 text-gray-300" />
                  </div>
                  <h5 className="text-sm font-bold text-gray-900">Initial Folder</h5>
                  <p className="text-gray-400 text-xs mt-1 max-w-[200px]">No quotations have been generated for this lead yet.</p>
                  <Link href={`/dashboard/leads/${selectedLead?.id}/quotation`}>
                    <Button variant="outline" size="sm" className="mt-6 text-[10px] uppercase font-black tracking-widest border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                      Create Project File
                    </Button>
                  </Link>
               </div>
             )}
          </div>
          
          <div className="p-4 bg-gray-50 border-t flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => setSelectedLeadId(null)} className="text-[11px] font-black text-gray-400 uppercase hover:text-gray-900 tracking-widest">
              Close Directory
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
