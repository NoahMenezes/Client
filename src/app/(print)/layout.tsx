import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Print – Perfect Knot CRM',
}

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
