import type { CollectionConfig } from 'payload'

export const Notes: CollectionConfig = {
  slug: 'notes',
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['lead', 'content', 'createdBy', 'createdAt'],
    description: 'Internal notes attached to leads.',
  },
  fields: [
    {
      name: 'lead',
      type: 'relationship',
      relationTo: 'leads',
      required: true,
      hasMany: false,
      admin: {
        description: 'The lead this note belongs to.',
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      admin: {
        placeholder: 'Write your note here...',
      },
    },
    {
      name: 'createdBy',
      type: 'text',
      admin: {
        description: 'Name or identifier of the person who created this note.',
        placeholder: 'e.g. John Doe',
      },
    },
    {
      name: 'pinned',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Pin this note to the top of the list.',
      },
    },
  ],
  timestamps: true,
}
