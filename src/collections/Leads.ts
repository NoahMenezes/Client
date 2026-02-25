import type { CollectionConfig } from 'payload'

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'leadId',
    defaultColumns: ['leadId', 'contact', 'status', 'weddingDate', 'createdAt'],
  },
  fields: [
    {
      name: 'leadId',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Auto-generated lead ID (e.g. PK1024)',
      },
    },
    {
      name: 'contact',
      type: 'relationship',
      relationTo: 'contacts',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Proposal Sent', value: 'proposal_sent' },
        { label: 'Negotiation', value: 'negotiation' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Closed', value: 'closed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'new',
      required: true,
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'weddingDate',
      type: 'date',
      admin: {
        description: 'The actual wedding/event date',
      },
    },
    {
      name: 'checkInDate',
      type: 'date',
    },
    {
      name: 'checkOutDate',
      type: 'date',
    },
    {
      name: 'guestCount',
      type: 'number',
    },
    {
      name: 'budget',
      type: 'number',
      admin: {
        description: 'Client budget',
      },
    },
    {
      name: 'weddingStyle',
      type: 'text',
      admin: {
        description: 'e.g. Traditional, Modern, etc.',
      },
    },
    {
      name: 'isDestination',
      type: 'checkbox',
      label: 'Is Destination Wedding?',
    },
    {
      name: 'googleFormRawData',
      type: 'json',
      admin: {
        description: 'Raw data from Google Form submission',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation === 'create' && data && !data.leadId) {
          const count = await req.payload.count({
            collection: 'leads',
            overrideAccess: true,
            req,
          })
          data.leadId = `PK${1000 + (count.totalDocs || 0) + 1}`
        }
        return data
      },
    ],
  },
  timestamps: true,
}
