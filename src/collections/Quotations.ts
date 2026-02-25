import type { CollectionConfig } from 'payload'

export const Quotations: CollectionConfig = {
  slug: 'quotations',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'lead', 'status', 'grandTotal', 'createdAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'lead',
      type: 'relationship',
      relationTo: 'leads',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Sent', value: 'sent' },
        { label: 'Approved', value: 'approved' },
      ],
      defaultValue: 'draft',
      required: true,
    },
    {
      name: 'subtotal',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'agencyFee',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'grandTotal',
      type: 'number',
      defaultValue: 0,
    },
  ],
  timestamps: true,
}
