import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Leads } from './collections/Leads'
import { Contacts } from './collections/Contacts'
import { Employees } from './collections/Employees'
import { Services } from './collections/Services'
import { ServiceCategories } from './collections/ServiceCategories'
import { LeadServices } from './collections/LeadServices'
import { Quotations } from './collections/Quotations'
import { QuotationItems } from './collections/QuotationItems'
import { Notes } from './collections/Notes'
import { Documents } from './collections/Documents'
import { LeadAssignments } from './collections/LeadAssignments'
import { FormFields } from './collections/FormFields'
import { Storage } from './collections/Storage'
import { Settings } from './globals/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Leads,
    Contacts,
    Employees,
    Services,
    ServiceCategories,
    LeadServices,
    Quotations,
    QuotationItems,
    Notes,
    Documents,
    LeadAssignments,
    FormFields,
    Storage,
  ],
  globals: [Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'YOUR_SECRET_HERE',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || 'file:./payload.db',
      authToken: process.env.DATABASE_URL_TOKEN || '',
    },
    push: false,
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
})
