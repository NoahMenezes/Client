import type { CollectionConfig } from 'payload'

export const LeadServices: CollectionConfig = {
  slug: 'lead-services',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['lead', 'service', 'quantity', 'custom_price'],
  },
  fields: [
    {
      name: 'lead',
      type: 'relationship',
      relationTo: 'leads',
      required: true,
    },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      required: true,
    },
    {
      name: 'quantity',
      type: 'number',
      required: true,
      defaultValue: 1,
    },
    {
      name: 'custom_price',
      type: 'number',
      admin: {
        description: 'Override base price for this specific lead',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
  timestamps: true,
}
