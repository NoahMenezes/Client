import type { CollectionConfig } from 'payload'

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'email', 'status', 'checkInDate', 'checkOutDate', 'createdAt'],
  },
  fields: [
    {
      name: 'fullName',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Opportunity', value: 'opportunity' },
        { label: 'Prospect', value: 'prospect' },
        { label: 'Won', value: 'won' },
        { label: 'Lost', value: 'lost' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'No Response', value: 'no-response' },
        { label: 'Disqualified', value: 'disqualified' },
        { label: 'Lost Prospect', value: 'lost-prospect' },
      ],
      defaultValue: 'opportunity',
      required: true,
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
      name: 'weddingDate',
      type: 'date',
      admin: {
        description: 'The actual wedding/event date',
      },
    },
    {
      name: 'budget',
      type: 'number',
      admin: {
        description: 'Client budget in ₹',
      },
    },
    {
      name: 'coupleName',
      type: 'text',
      admin: {
        description: 'e.g. Eleanor & Mark Vance',
      },
    },
    {
      name: 'leadSource',
      type: 'select',
      options: [
        { label: 'Website Enquiry', value: 'website' },
        { label: 'Referral', value: 'referral' },
        { label: 'Social Media', value: 'social-media' },
        { label: 'Walk-in', value: 'walk-in' },
        { label: 'Phone Call', value: 'phone-call' },
        { label: 'Email', value: 'email' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'website',
    },
    {
      name: 'servicesRequested',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Venue Decoration', value: 'venue-decoration' },
        { label: 'Catering', value: 'catering' },
        { label: 'Photography', value: 'photography' },
        { label: 'DJ & Music', value: 'dj-music' },
        { label: 'Mehendi', value: 'mehendi' },
        { label: 'Florals', value: 'florals' },
        { label: 'Lighting', value: 'lighting' },
        { label: 'Hospitality', value: 'hospitality' },
        { label: 'Baraat', value: 'baraat' },
        { label: 'Special Effects', value: 'special-effects' },
      ],
    },
    {
      name: 'assignedEmployee',
      type: 'relationship',
      relationTo: 'employees',
      hasMany: false,
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: {
        description: 'Latest note / Google Form Enquiry response',
      },
    },
    {
      name: 'basicInformation',
      type: 'textarea',
      admin: {
        description: 'e.g. Traditional Indian Wedding, approx. 300 guests, 3-day event.',
      },
    },
    {
      name: 'hospitalityServices',
      type: 'textarea',
      admin: {
        description: 'Hospitality & Misc. Services details',
      },
    },
    {
      name: 'typesOfServiceRequired',
      type: 'textarea',
      admin: {
        description: 'Free-form description of all services required',
      },
    },
    {
      name: 'artistsRequirement',
      type: 'textarea',
      admin: {
        description: 'Artists & entertainment requirements',
      },
    },
    {
      name: 'googleFormEnquiry',
      type: 'textarea',
      admin: {
        description: 'Raw response from the client intake Google Form',
      },
    },
    {
      name: 'firstCallDate',
      type: 'date',
    },
    {
      name: 'proposalSentDate',
      type: 'date',
    },
    {
      name: 'pocName',
      type: 'text',
      label: 'POC Name',
      admin: {
        description: 'Point of Contact name',
      },
    },
    {
      name: 'quotation',
      type: 'array',
      label: 'Quotation Items (Legacy)',
      admin: {
        description: 'Legacy simple quotation. Use the Quotations collection for full quotations.',
      },
      fields: [
        {
          name: 'service',
          type: 'text',
          required: true,
        },
        {
          name: 'pricePerUnit',
          type: 'number',
          required: true,
        },
        {
          name: 'units',
          type: 'number',
          required: true,
          defaultValue: 1,
        },
        {
          name: 'total',
          type: 'number',
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'grandTotal',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Auto-calculated from quotation items',
      },
    },
    {
      name: 'leadId',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Auto-generated lead ID (e.g. PK1024)',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.quotation && Array.isArray(data.quotation)) {
          let grand = 0
          data.quotation = data.quotation.map(
            (item: { service: string; pricePerUnit: number; units: number; total?: number }) => {
              const total = (item.pricePerUnit ?? 0) * (item.units ?? 1)
              grand += total
              return { ...item, total }
            },
          )
          data.grandTotal = grand
        }
        return data
      },
    ],
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation === 'create' && data && !data.leadId) {
          const count = await req.payload.count({
            collection: 'leads',
            overrideAccess: true,
            req,
          })
          data.leadId = `PK${1000 + count.totalDocs + 1}`
        }
        return data
      },
    ],
  },
  timestamps: true,
}
