import type { CollectionConfig } from 'payload'

export const LeadAssignments: CollectionConfig = {
  slug: 'lead-assignments',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    {
      name: 'lead',
      type: 'relationship',
      relationTo: 'leads',
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Sales', value: 'sales' },
        { label: 'Coordinator', value: 'coordinator' },
        { label: 'Manager', value: 'manager' },
      ],
      required: true,
    },
  ],
  timestamps: true,
}
