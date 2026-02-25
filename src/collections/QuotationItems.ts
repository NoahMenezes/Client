import type { CollectionConfig } from 'payload'

export const QuotationItems: CollectionConfig = {
  slug: 'quotation-items',
  admin: {
    useAsTitle: 'serviceNameSnapshot',
  },
  fields: [
    {
      name: 'quotation',
      type: 'relationship',
      relationTo: 'quotations',
      required: true,
    },
    {
      name: 'serviceNameSnapshot',
      type: 'text',
      required: true,
      admin: {
        description: 'Name of the service at the time of quotation creation',
      },
    },
    {
      name: 'unitPrice',
      type: 'number',
      required: true,
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
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        data.total = (data.unitPrice ?? 0) * (data.quantity ?? 1)
        return data
      },
    ],
  },
  timestamps: true,
}
