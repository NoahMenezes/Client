import type { CollectionConfig } from 'payload'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'base_price', 'is_active', 'createdAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'service-categories',
      required: true,
    },
    {
      name: 'base_price',
      type: 'number',
      required: true,
      admin: {
        description: 'Default price for this service',
      },
    },
    {
      name: 'religion_type',
      type: 'text',
      admin: {
        description: 'e.g. Hindu, Christian (optional)',
      },
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  timestamps: true,
}
