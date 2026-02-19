import type { CollectionConfig } from 'payload'

export const FormFields: CollectionConfig = {
  slug: 'form-fields',
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'fieldType', 'required', 'createdAt'],
  },
  fields: [
    { name: 'label', type: 'text', required: true },
    {
      name: 'fieldType',
      type: 'select',
      required: true,
      options: [
        { label: 'Short Text', value: 'text' },
        { label: 'Long Text', value: 'textarea' },
        { label: 'Number', value: 'number' },
        { label: 'Date', value: 'date' },
        { label: 'Email', value: 'email' },
        { label: 'Phone', value: 'phone' },
        { label: 'Select', value: 'select' },
        { label: 'Multi-select', value: 'multi-select' },
        { label: 'Checkbox', value: 'checkbox' },
      ],
      defaultValue: 'text',
    },
    { name: 'required', type: 'checkbox', defaultValue: false },
    {
      name: 'options',
      type: 'array',
      admin: { description: 'Options for select/multi-select fields' },
      fields: [{ name: 'value', type: 'text', required: true }],
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
  ],
  timestamps: true,
}
