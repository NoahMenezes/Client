import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  admin: {
    group: 'Configuration',
  },
  fields: [
    {
      name: 'companyName',
      type: 'text',
      defaultValue: 'Perfect Knot',
    },
    {
      name: 'companyTagline',
      type: 'text',
      defaultValue: 'CRM',
    },
    {
      name: 'contactEmail',
      type: 'email',
    },
    {
      name: 'contactPhone',
      type: 'text',
    },
    {
      name: 'address',
      type: 'textarea',
    },
    {
      name: 'currency',
      type: 'select',
      options: [
        { label: 'INR (₹)', value: 'INR' },
        { label: 'USD ($)', value: 'USD' },
        { label: 'EUR (€)', value: 'EUR' },
      ],
      defaultValue: 'INR',
    },
    {
      name: 'timezone',
      type: 'text',
      defaultValue: 'Asia/Kolkata',
    },
    {
      name: 'maintenanceMode',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
