import type { CollectionConfig } from 'payload'

export const Storage: CollectionConfig = {
  slug: 'storage',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'size', 'status', 'createdAt'],
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
      name: 'type',
      type: 'select',
      options: [
        { label: 'Document', value: 'document' },
        { label: 'Image', value: 'image' },
        { label: 'Video', value: 'video' },
        { label: 'Audio', value: 'audio' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'document',
    },
    {
      name: 'size',
      type: 'number',
      admin: {
        description: 'File size in bytes',
      },
    },
    {
      name: 'url',
      type: 'text',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
        { label: 'Deleted', value: 'deleted' },
      ],
      defaultValue: 'active',
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
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
