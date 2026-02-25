import type { CollectionConfig } from 'payload'

export const Documents: CollectionConfig = {
  slug: 'documents',
  admin: {
    useAsTitle: 'fileName',
  },
  fields: [
    {
      name: 'lead',
      type: 'relationship',
      relationTo: 'leads',
      required: true,
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'fileUrl',
      type: 'text',
      required: true,
    },
    {
      name: 'fileName',
      type: 'text',
      required: true,
    },
  ],
  timestamps: true,
}
