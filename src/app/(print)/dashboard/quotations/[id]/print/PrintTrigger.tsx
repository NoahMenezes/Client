'use client'

import { useEffect } from 'react'

export default function PrintTrigger() {
  useEffect(() => {
    // Wire up the print button
    const btn = document.getElementById('print-btn')
    if (btn) {
      btn.onclick = () => window.print()
    }
  }, [])

  return null
}
