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
      name: 'categories',
      type: 'json',
      admin: {
        description: 'JSON array of quotation categories and their line items',
      },
    },
    {
      name: 'agencyFeePercent',
      type: 'number',
      defaultValue: 12,
      admin: {
        description: 'Agency fee percentage applied to subtotal',
      },
    },
    {
      name: 'quotationDate',
      type: 'date',
    },
    {
      name: 'weddingDate',
      type: 'date',
    },
    {
      name: 'guestCount',
      type: 'number',
    },
    {
      name: 'venue',
      type: 'text',
    },
    {
      name: 'currency',
      type: 'select',
      options: [
        { label: 'INR (₹)', value: 'INR' },
        { label: 'USD ($)', value: 'USD' },
        { label: 'EUR (€)', value: 'EUR' },
        { label: 'GBP (£)', value: 'GBP' },
      ],
      defaultValue: 'INR',
      required: true,
    },
    {
      name: 'notes',
      type: 'textarea',
    },
    {
      name: 'subTotal',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'agencyFees',
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

