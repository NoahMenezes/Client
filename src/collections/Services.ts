import type { CollectionConfig } from 'payload'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'base_price', 'is_active', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return {
        createdBy: { equals: user.id },
      }
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return {
        createdBy: { equals: user.id },
      }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return {
        createdBy: { equals: user.id },
      }
    },
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
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ req, operation }) => {
            if (operation === 'create' && req.user) {
              return req.user.id
            }
          },
        ],
      },
    },
  ],
  timestamps: true,
}
