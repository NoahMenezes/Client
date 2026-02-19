import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { LeadsTable } from "@/components/leads-table"

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const { q = '' } = await searchParams

  let totalLeads = 0, opportunityCount = 0, prospectCount = 0, wonCount = 0
  let leads: any[] = []
  let totalDocs = 0

  try {
    const payload = await getPayload({ config: configPromise })

    // Build search filter
    const where: Record<string, any> = q
      ? { or: [{ fullName: { contains: q } }, { email: { contains: q } }, { leadId: { contains: q } }] }
      : {}

    // Get counts using find with limit:0
    const [allResult, oppResult, prosResult, wonResult, recentLeads] = await Promise.all([
      payload.find({ collection: 'leads', limit: 0, overrideAccess: true }),
      payload.find({ collection: 'leads', limit: 0, where: { status: { equals: 'opportunity' } }, overrideAccess: true }),
      payload.find({ collection: 'leads', limit: 0, where: { status: { equals: 'prospect' } }, overrideAccess: true }),
      payload.find({ collection: 'leads', limit: 0, where: { status: { equals: 'won' } }, overrideAccess: true }),
      payload.find({ collection: 'leads', limit: 10, sort: '-createdAt', overrideAccess: true, depth: 0, where }),
    ])

    totalLeads = allResult.totalDocs
    opportunityCount = oppResult.totalDocs
    prospectCount = prosResult.totalDocs
    wonCount = wonResult.totalDocs
    totalDocs = recentLeads.totalDocs

    // Serialize leads — strip non-serializable Payload internals
    leads = recentLeads.docs.map((d: any) => ({
      id: d.id,
      leadId: d.leadId ?? null,
      fullName: d.fullName ?? '',
      email: d.email ?? '',
      phone: d.phone ?? null,
      status: d.status ?? 'opportunity',
      checkInDate: d.checkInDate ?? null,
      checkOutDate: d.checkOutDate ?? null,
    }))
  } catch (e) {
    console.error('Dashboard fetch error:', e)
  }

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards
              totalLeads={totalLeads}
              opportunityCount={opportunityCount}
              prospectCount={prospectCount}
              wonCount={wonCount}
            />
            <div className="px-4 lg:px-6">
              <LeadsTable leads={leads} totalDocs={totalDocs} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
