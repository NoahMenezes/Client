import type { CollectionConfig } from 'payload'

export const ServiceCategories: CollectionConfig = {
  slug: 'service-categories',
  admin: {
    useAsTitle: 'name',
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
