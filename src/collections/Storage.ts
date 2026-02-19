import type { CollectionConfig } from 'payload'

export const Storage: CollectionConfig = {
  slug: 'storage',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'size', 'status', 'createdAt'],
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
  ],
  timestamps: true,
}
