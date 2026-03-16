import React, { Suspense } from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SiteHeader } from '@/components/site-header'
import { 
  Folder, 
  FileText, 
  Calendar, 
  DollarSign, 
  ArrowRight,
  Archive,
  Search,
  Users
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
              <p className="text-gray-500 mt-1">Manage and explore all leads and their associated quotations in a structured grid.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="bg-white">
                <Search className="size-4 mr-2" />
                Filter leads
              </Button>
            </div>
          </div>

          {/* Grid Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/50 backdrop-blur-sm border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <Users className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Leads</p>
                    <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/50 backdrop-blur-sm border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                    <FileText className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Files</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Object.values(quotesByLead).flat().length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/50 backdrop-blur-sm border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 rounded-xl text-green-600">
                    <DollarSign className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Storage Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹ {Object.values(quotesByLead).flat().reduce((acc, q) => acc + (q.grandTotal || 0), 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/50 backdrop-blur-sm border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                    <Archive className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Archive Status</p>
                    <p className="text-2xl font-bold text-gray-900">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* The Main Grid */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leads.map((lead: any) => {
                const quotes = quotesByLead[lead.id] || []
                const fullName = typeof lead.contact === 'object' ? lead.contact.name : 'Unknown'
                const leadDisplayId = lead.leadId || `PK-${lead.id}`

                return (
                  <Card key={lead.id} className="group hover:shadow-lg transition-all duration-300 border-gray-200 overflow-hidden bg-white">
                    <CardHeader className="bg-gray-50/50 border-b pb-4">
                      <div className="flex items-start justify-between">
                        <div className="p-2 bg-blue-100/50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                          <Folder className="size-5" />
                        </div>
                        <Badge className={`text-[10px] px-2 py-0 ${statusStyles[lead.status] || 'bg-gray-100'}`}>
                          {statusLabels[lead.status] || lead.status}
                        </Badge>
                      </div>
                      <div className="mt-4">
                        <Link href={`/dashboard/leads/${lead.id}`} className="hover:text-blue-600 transition-colors">
                          <CardTitle className="text-lg font-bold truncate line-clamp-1">{fullName}</CardTitle>
                        </Link>
                        <CardDescription className="text-xs font-mono uppercase tracking-wider mt-1">{leadDisplayId}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 pb-2">
                      <div className="space-y-4">
                        {/* Quotes list (mini) */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Quotations ({quotes.length})</p>
                          {quotes.length > 0 ? (
                            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                              {quotes.slice(0, 3).map((q: any) => (
                                <Link key={q.id} href={`/dashboard/quotations/${q.id}`} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all group/quote">
                                  <div className="flex items-center gap-2">
                                    <FileText className="size-3.5 text-gray-400 group-hover/quote:text-blue-500" />
                                    <span className="text-xs text-gray-600 truncate max-w-[120px]">{q.title}</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-gray-900 group-hover/quote:text-blue-600">
                                    ₹{(q.grandTotal || 0).toLocaleString('en-IN')}
                                  </span>
                                </Link>
                              ))}
                              {quotes.length > 3 && (
                                <p className="text-[10px] text-gray-400 pt-1">+ {quotes.length - 3} more files...</p>
                              )}
                            </div>
                          ) : (
                            <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-lg">
                              <p className="text-[10px] text-gray-400 font-medium italic">Empty Directory</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 pb-4 bg-gray-50/30 border-t flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="size-3" />
                        <span className="text-[10px]">Updated {new Date(lead.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <Link href={`/dashboard/leads/${lead.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 border border-transparent hover:border-blue-100">
                          View Profile
                          <ArrowRight className="size-3 ml-1.5" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Style for custom behavior */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}} />
    </div>
  )
}
