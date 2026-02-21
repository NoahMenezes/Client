import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IconPencil, IconTrash } from '@tabler/icons-react'
import { SiteHeader } from '@/components/site-header'

export default async function ServicesPage() {
  const payload = await getPayload({ config: configPromise })
  const services = await payload.find({ collection: 'services', overrideAccess: true })

  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<div className="h-12 border-b bg-white" />}>
        <SiteHeader title="Services">
          <Link href="/dashboard/services/add">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">+ Add Service</Button>
          </Link>
        </SiteHeader>
      </Suspense>
      <div className="p-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Catalog</CardTitle>
          </CardHeader>
          <CardContent>
            {services.totalDocs === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                No services found. Click &quot;Add Service&quot; to create one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase text-muted-foreground">
                      <th className="px-4 py-2 text-left bg-muted/50 font-medium">Service Name</th>
                      <th className="px-4 py-2 text-left bg-muted/50 font-medium">Category</th>
                      <th className="px-4 py-2 text-left bg-muted/50 font-medium">Unit</th>
                      <th className="px-4 py-2 text-right bg-muted/50 font-medium">Price (₹)</th>
                      <th className="px-4 py-2 text-right bg-muted/50 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.docs.map((service: any) => (
                      <tr key={service.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-2 font-medium">{service.serviceName}</td>
                        <td className="px-4 py-2 capitalize">{service.category}</td>
                        <td className="px-4 py-2 capitalize">{service.unit}</td>
                        <td className="px-4 py-2 text-right">
                          ₹{service.price.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                              <IconPencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
