import type { CollectionConfig } from 'payload'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'serviceName',
    defaultColumns: ['serviceName', 'category', 'unit', 'price', 'createdAt'],
  },
  fields: [
    { name: 'serviceName', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Photography', value: 'photography' },
        { label: 'Coordination', value: 'coordination' },
        { label: 'Decor', value: 'decor' },
        { label: 'Catering', value: 'catering' },
        { label: 'Entertainment', value: 'entertainment' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'other',
    },
    {
      name: 'unit',
      type: 'select',
      options: [
        { label: 'Per Event', value: 'per-event' },
        { label: 'Per Plate', value: 'per-plate' },
        { label: 'Per Hour', value: 'per-hour' },
        { label: 'Package', value: 'package' },
        { label: 'Per Unit', value: 'per-unit' },
      ],
      defaultValue: 'per-event',
    },
    { name: 'price', type: 'number', required: true },
  ],
  timestamps: true,
}
