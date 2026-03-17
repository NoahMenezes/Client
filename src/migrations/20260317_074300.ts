import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(
    sql`ALTER TABLE \`contacts\` ADD COLUMN \`created_by_id\` integer REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null;`,
  )
  await db.run(
    sql`ALTER TABLE \`leads\` ADD COLUMN \`created_by_id\` integer REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null;`,
  )
  await db.run(
    sql`ALTER TABLE \`quotations\` ADD COLUMN \`created_by_id\` integer REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null;`,
  )
  await db.run(
    sql`ALTER TABLE \`employees\` ADD COLUMN \`created_by_id\` integer REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null;`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // SQLite does not support DROP COLUMN in all versions, so recreate tables without the column
  // Contacts
  await db.run(sql`CREATE TABLE \`contacts_temp\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`name\` text NOT NULL,
    \`email\` text NOT NULL,
    \`phone\` text,
    \`source\` text,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );`)
  await db.run(
    sql`INSERT INTO \`contacts_temp\` (\`id\`, \`name\`, \`email\`, \`phone\`, \`source\`, \`updated_at\`, \`created_at\`) SELECT \`id\`, \`name\`, \`email\`, \`phone\`, \`source\`, \`updated_at\`, \`created_at\` FROM \`contacts\`;`,
  )
  await db.run(sql`DROP TABLE \`contacts\`;`)
  await db.run(sql`ALTER TABLE \`contacts_temp\` RENAME TO \`contacts\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`contacts_email_idx\` ON \`contacts\` (\`email\`);`)
  await db.run(sql`CREATE INDEX \`contacts_updated_at_idx\` ON \`contacts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`contacts_created_at_idx\` ON \`contacts\` (\`created_at\`);`)

  // Leads
  await db.run(sql`CREATE TABLE \`leads_temp\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`lead_id\` text,
    \`contact_id\` integer NOT NULL,
    \`status\` text DEFAULT 'new' NOT NULL,
    \`assigned_to_id\` integer,
    \`wedding_date\` text,
    \`check_in_date\` text,
    \`check_out_date\` text,
    \`guest_count\` numeric,
    \`budget\` numeric,
    \`wedding_style\` text,
    \`is_destination\` integer,
    \`google_form_raw_data\` text,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    FOREIGN KEY (\`contact_id\`) REFERENCES \`contacts\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`assigned_to_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`)
  await db.run(
    sql`INSERT INTO \`leads_temp\` (\`id\`, \`lead_id\`, \`contact_id\`, \`status\`, \`assigned_to_id\`, \`wedding_date\`, \`check_in_date\`, \`check_out_date\`, \`guest_count\`, \`budget\`, \`wedding_style\`, \`is_destination\`, \`google_form_raw_data\`, \`updated_at\`, \`created_at\`) SELECT \`id\`, \`lead_id\`, \`contact_id\`, \`status\`, \`assigned_to_id\`, \`wedding_date\`, \`check_in_date\`, \`check_out_date\`, \`guest_count\`, \`budget\`, \`wedding_style\`, \`is_destination\`, \`google_form_raw_data\`, \`updated_at\`, \`created_at\` FROM \`leads\`;`,
  )
  await db.run(sql`DROP TABLE \`leads\`;`)
  await db.run(sql`ALTER TABLE \`leads_temp\` RENAME TO \`leads\`;`)
  await db.run(sql`CREATE INDEX \`leads_contact_idx\` ON \`leads\` (\`contact_id\`);`)
  await db.run(sql`CREATE INDEX \`leads_assigned_to_idx\` ON \`leads\` (\`assigned_to_id\`);`)
  await db.run(sql`CREATE INDEX \`leads_updated_at_idx\` ON \`leads\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`leads_created_at_idx\` ON \`leads\` (\`created_at\`);`)

  // Quotations
  await db.run(sql`CREATE TABLE \`quotations_temp\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`title\` text NOT NULL,
    \`lead_id\` integer NOT NULL,
    \`status\` text DEFAULT 'draft' NOT NULL,
    \`categories\` text,
    \`agency_fee_percent\` numeric DEFAULT 12,
    \`quotation_date\` text,
    \`notes\` text,
    \`sub_total\` numeric DEFAULT 0,
    \`agency_fees\` numeric DEFAULT 0,
    \`grand_total\` numeric DEFAULT 0,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    FOREIGN KEY (\`lead_id\`) REFERENCES \`leads\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`)
  await db.run(
    sql`INSERT INTO \`quotations_temp\` (\`id\`, \`title\`, \`lead_id\`, \`status\`, \`categories\`, \`agency_fee_percent\`, \`quotation_date\`, \`notes\`, \`sub_total\`, \`agency_fees\`, \`grand_total\`, \`updated_at\`, \`created_at\`) SELECT \`id\`, \`title\`, \`lead_id\`, \`status\`, \`categories\`, \`agency_fee_percent\`, \`quotation_date\`, \`notes\`, \`sub_total\`, \`agency_fees\`, \`grand_total\`, \`updated_at\`, \`created_at\` FROM \`quotations\`;`,
  )
  await db.run(sql`DROP TABLE \`quotations\`;`)
  await db.run(sql`ALTER TABLE \`quotations_temp\` RENAME TO \`quotations\`;`)
  await db.run(sql`CREATE INDEX \`quotations_lead_idx\` ON \`quotations\` (\`lead_id\`);`)
  await db.run(sql`CREATE INDEX \`quotations_updated_at_idx\` ON \`quotations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`quotations_created_at_idx\` ON \`quotations\` (\`created_at\`);`)

  // Employees
  await db.run(sql`CREATE TABLE \`employees_temp\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`name\` text NOT NULL,
    \`email\` text NOT NULL,
    \`phone\` text,
    \`role\` text,
    \`status\` text DEFAULT 'active',
    \`department\` text,
    \`notes\` text,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );`)
  await db.run(
    sql`INSERT INTO \`employees_temp\` (\`id\`, \`name\`, \`email\`, \`phone\`, \`role\`, \`status\`, \`department\`, \`notes\`, \`updated_at\`, \`created_at\`) SELECT \`id\`, \`name\`, \`email\`, \`phone\`, \`role\`, \`status\`, \`department\`, \`notes\`, \`updated_at\`, \`created_at\` FROM \`employees\`;`,
  )
  await db.run(sql`DROP TABLE \`employees\`;`)
  await db.run(sql`ALTER TABLE \`employees_temp\` RENAME TO \`employees\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`employees_email_idx\` ON \`employees\` (\`email\`);`)
  await db.run(sql`CREATE INDEX \`employees_updated_at_idx\` ON \`employees\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`employees_created_at_idx\` ON \`employees\` (\`created_at\`);`)
}
