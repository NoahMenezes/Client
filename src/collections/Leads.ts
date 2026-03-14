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
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'The user account that created this lead',
        readOnly: true,
      },
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
        description: 'Numeric value of the budget',
      },
    },
    {
      name: 'budgetText',
      type: 'text',
      admin: {
        description: 'Budget range or description from form',
      },
    },
    {
      name: 'weddingStyle',
      type: 'select',
      options: [
        { label: 'Hindu Wedding', value: 'hindu' },
        { label: 'Jain Wedding', value: 'jain' },
        { label: 'Sikh Wedding', value: 'sikh' },
        { label: 'Inter Faith Wedding', value: 'inter_faith' },
        { label: 'Catholic Wedding', value: 'catholic' },
        { label: 'Islamic Wedding', value: 'islamic' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'isDestination',
      type: 'checkbox',
      label: 'Is Destination Wedding?',
    },
    {
      name: 'resortCategory',
      type: 'text',
      admin: {
        description: 'e.g. 3 Star, 4 Star, 5 Star',
      },
    },
    {
      name: 'cuisineType',
      type: 'text',
      admin: {
        description: 'e.g. Veg, Non Veg',
      },
    },
    {
      name: 'servicesLookedFor',
      type: 'text',
      admin: {
        description: 'Selected services',
      },
    },
    {
      name: 'weddingCeremonies',
      type: 'text',
      admin: {
        description: 'Ceremonies selected',
      },
    },
    {
      name: 'entertainmentOptions',
      type: 'text',
      admin: {
        description: 'Entertainment options selected',
      },
    },
    {
      name: 'hospitalityServices',
      type: 'text',
      admin: {
        description: 'Hospitality services selected',
      },
    },
    {
      name: 'additionalServices',
      type: 'text',
      admin: {
        description: 'Additional services selected',
      },
    },
    {
      name: 'referralSource',
      type: 'text',
      admin: {
        description: 'Where they found out about us',
      },
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
