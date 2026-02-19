import type { CollectionConfig } from 'payload'

export const Quotations: CollectionConfig = {
  slug: 'quotations',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'lead', 'grandTotal', 'status', 'quotationDate', 'createdAt'],
    description: 'Manage quotations created for leads.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "Wedding Package – Priya & Rohan"',
      },
    },
    {
      name: 'lead',
      type: 'relationship',
      relationTo: 'leads',
      required: true,
      hasMany: false,
      admin: {
        description: 'The lead this quotation belongs to.',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Sent', value: 'sent' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      defaultValue: 'draft',
      required: true,
    },
    {
      name: 'quotationDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'MMM d, yyyy',
        },
      },
    },
    {
      name: 'agencyFeePercent',
      type: 'number',
      defaultValue: 12,
      admin: {
        description: 'Agency fee percentage (e.g. 12 for 12%)',
      },
    },
    {
      name: 'categories',
      type: 'array',
      label: 'Quotation Categories',
      admin: {
        description: 'Group line items by category (e.g. Guest Hospitality, Artists & Entertainment)',
      },
      fields: [
        {
          name: 'categoryName',
          type: 'text',
          required: true,
          admin: {
            placeholder: 'e.g. Guest Hospitality',
          },
        },
        {
          name: 'items',
          type: 'array',
          label: 'Line Items',
          fields: [
            {
              name: 'particulars',
              type: 'text',
              required: true,
              admin: {
                placeholder: 'e.g. Airport Management Team (Team of 4)',
              },
            },
            {
              name: 'amount',
              type: 'number',
              required: true,
              defaultValue: 0,
            },
            {
              name: 'quantity',
              type: 'number',
              required: true,
              defaultValue: 1,
            },
            {
              name: 'total',
              type: 'number',
              admin: {
                readOnly: true,
                description: 'Auto-calculated: amount × quantity',
              },
            },
            {
              name: 'remarks',
              type: 'text',
              admin: {
                placeholder: 'e.g. Daily basis',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'subTotal',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Auto-calculated sum of all line items.',
      },
    },
    {
      name: 'agencyFees',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Auto-calculated: subTotal × agencyFeePercent / 100',
      },
    },
    {
      name: 'grandTotal',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Auto-calculated: subTotal + agencyFees',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about this quotation.',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.categories && Array.isArray(data.categories)) {
          let subTotal = 0

          data.categories = data.categories.map(
            (cat: { categoryName: string; items?: Array<{ particulars: string; amount: number; quantity: number; total?: number; remarks?: string }> }) => {
              const items = (cat.items || []).map(
                (item: { particulars: string; amount: number; quantity: number; total?: number; remarks?: string }) => {
                  const total = (item.amount ?? 0) * (item.quantity ?? 1)
                  subTotal += total
                  return { ...item, total }
                },
              )
              return { ...cat, items }
            },
          )

          const agencyFeePercent = data.agencyFeePercent ?? 12
          const agencyFees = Math.round(subTotal * agencyFeePercent) / 100
          data.subTotal = subTotal
          data.agencyFees = agencyFees
          data.grandTotal = subTotal + agencyFees
        }
        return data
      },
    ],
  },
  timestamps: true,
}
