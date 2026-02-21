import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Print – Perfect Knot CRM',
}

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
