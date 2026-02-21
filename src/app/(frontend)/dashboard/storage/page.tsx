import React, { Suspense } from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SiteHeader } from '@/components/site-header'
import { IconFile, IconPhoto, IconVideo, IconMusic, IconFileUnknown } from '@tabler/icons-react'

const typeIcons: Record<string, any> = {
  document: IconFile,
  image: IconPhoto,
  video: IconVideo,
  audio: IconMusic,
  other: IconFileUnknown,
}

function formatSize(bytes: number | null | undefined) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export default async function StoragePage() {
  let files: any[] = []
  let totalDocs = 0
  try {
    const payload = await getPayload({ config: configPromise })
    const res = await payload.find({
      collection: 'storage',
      limit: 50,
      sort: '-createdAt',
      overrideAccess: true,
    })
    files = res.docs.map((d: any) => ({
      id: d.id,
      name: d.name ?? '',
      type: d.type ?? 'other',
      size: d.size ?? null,
      status: d.status ?? 'active',
      url: d.url ?? null,
      createdAt: d.createdAt,
    }))
    totalDocs = res.totalDocs
  } catch (e) {
    console.error('Storage fetch error:', e)
  }

  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<div className="h-12 border-b bg-white" />}>
        <SiteHeader title="Storage" />
      </Suspense>
      <main className="flex-1 overflow-auto p-6">
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          {files.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No files uploaded yet. Manage files through the{' '}
              <Link href="/admin/collections/storage" className="text-blue-600 underline">
                admin panel
              </Link>
              .
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Size</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {files.map((f: any) => {
                  const Icon = typeIcons[f.type] || IconFileUnknown
                  return (
                    <tr key={f.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3 flex items-center gap-2">
                        <Icon className="size-4 text-muted-foreground" />
                        <span className="font-medium">{f.name}</span>
                      </td>
                      <td className="px-4 py-3 capitalize">{f.type}</td>
                      <td className="px-4 py-3">{formatSize(f.size)}</td>
                      <td className="px-4 py-3 capitalize">{f.status}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(f.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          <div className="px-4 py-3 border-t text-sm text-muted-foreground">
            Showing <strong>{files.length}</strong> of <strong>{totalDocs}</strong>
          </div>
        </div>
      </main>
    </div>
  )
}
