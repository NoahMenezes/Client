import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(
    sql`ALTER TABLE \`contacts\` ADD COLUMN \`created_by_id\` integer REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null;`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // SQLite does not support DROP COLUMN in all versions, so recreate table without the column
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
}
