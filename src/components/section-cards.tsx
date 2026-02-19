import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Props {
  totalLeads: number
  opportunityCount: number
  prospectCount: number
  wonCount: number
}

export function SectionCards({ totalLeads, opportunityCount, prospectCount, wonCount }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader className="pb-4">
          <CardDescription>Total Leads</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalLeads.toLocaleString()}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader className="pb-4">
          <CardDescription>Active (Opportunity)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {opportunityCount.toLocaleString()}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader className="pb-4">
          <CardDescription>Advanced (Prospect)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {prospectCount.toLocaleString()}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader className="pb-4">
          <CardDescription>Converted (Won)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {wonCount.toLocaleString()}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
