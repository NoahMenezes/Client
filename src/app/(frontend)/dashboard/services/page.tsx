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
  const services = await payload.find({ collection: 'services', overrideAccess: true, depth: 1 })

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
                      <th className="px-4 py-2 text-right bg-muted/50 font-medium">Price (₹)</th>
                      <th className="px-4 py-2 text-left bg-muted/50 font-medium">Status</th>
                      <th className="px-4 py-2 text-right bg-muted/50 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.docs.map((service: any) => {
                      const categoryName =
                        typeof service.category === 'object' && service.category
                          ? service.category.name
                          : (service.category ?? '—')
                      const price = service.base_price ?? 0

                      return (
                        <tr key={service.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-2 font-medium">{service.name}</td>
                          <td className="px-4 py-2 capitalize">{categoryName}</td>
                          <td className="px-4 py-2 text-right">₹{price.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                service.is_active !== false
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {service.is_active !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/dashboard/services/${service.id}/edit`}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-600"
                                >
                                  <IconPencil className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                                <IconTrash className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
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
