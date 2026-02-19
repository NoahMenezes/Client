'use client'

import React, { useState } from 'react'
import { useActionState } from 'react'
import Link from 'next/link'
import { updateQuotation, type ActionState } from '@/app/actions/leads'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IconTrash, IconPlus } from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface QuotationItem { service: string; pricePerUnit: number; units: number }

export default function EditQuotationClient({ lead }: { lead: any }) {
  const [items, setItems] = useState<QuotationItem[]>(
    (lead.quotation || []).map((q: any) => ({ service: q.service, pricePerUnit: q.pricePerUnit, units: q.units }))
  )
  const [state, action, isPending] = useActionState<ActionState, FormData>(updateQuotation, null)

  const addRow = () => setItems([...items, { service: '', pricePerUnit: 0, units: 1 }])
  const removeRow = (i: number) => setItems(items.filter((_, idx) => idx !== i))
  const update = (i: number, field: keyof QuotationItem, value: string | number) => {
    const next = [...items]
    if (field === 'service') next[i].service = value as string
    else next[i][field] = Number(value) || 0
    setItems(next)
  }

  const grandTotal = items.reduce((s, r) => s + r.pricePerUnit * r.units, 0)

  return (
    <div className="flex flex-1 flex-col p-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Edit Quotation &ndash; {lead.fullName}</h1>
      </div>

      {state && !state.success && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">{state.message}</div>
      )}

      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f9fafb]">
                <tr className="border-b">
                  <th className="px-6 py-4 text-left font-semibold text-gray-500 w-[40%]">Service Name</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-500 w-[20%]">Price per unit (₹)</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-500 w-[15%]">Units</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-500 w-[20%]">Total</th>
                  <th className="px-4 py-4 w-[5%]"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item, i) => (
                  <tr key={i} className="group hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <Input
                        value={item.service}
                        onChange={(e) => update(i, 'service', e.target.value)}
                        className="border-gray-200 focus:ring-blue-500"
                        placeholder="Service name"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Input
                        type="number"
                        value={item.pricePerUnit || ''}
                        onChange={(e) => update(i, 'pricePerUnit', e.target.value)}
                        className="text-right border-gray-200 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Input
                        type="number"
                        value={item.units || ''}
                        onChange={(e) => update(i, 'units', e.target.value)}
                        className="text-right border-gray-200 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-700">
                      ₹{(item.pricePerUnit * item.units).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(i)}
                        className="text-gray-400 hover:text-red-600 transition-colors tooltip tooltip-left"
                        data-tip="Delete Row"
                      >
                        <IconTrash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-5 bg-gray-50/30 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRow}
              className="gap-2 text-gray-600 hover:text-blue-600 border-dashed border-gray-300 hover:border-blue-400"
            >
              <IconPlus className="h-4 w-4" /> Add Row
            </Button>
            <div className="flex items-center gap-4">
              <span className="text-gray-500 font-medium">Grand Total</span>
              <span className="text-2xl font-bold text-gray-900">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end mt-8">
        <Link href={`/dashboard/leads/${lead.id}`}>
          <Button variant="ghost" className="px-6 text-gray-600 hover:text-gray-900">Cancel</Button>
        </Link>
        <form action={action}>
          <input type="hidden" name="id" value={String(lead.id)} />
          <input type="hidden" name="quotation" value={JSON.stringify(items)} />
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-sm" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </div>
  )
}
