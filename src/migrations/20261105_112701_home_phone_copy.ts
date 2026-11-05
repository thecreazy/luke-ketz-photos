import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "home_hint_phone" varchar DEFAULT 'Scorri per entrare nel campo ↓';
  ALTER TABLE "pages" ADD COLUMN "home_open" varchar DEFAULT 'Apri il ritratto →';
  ALTER TABLE "_pages_v" ADD COLUMN "version_home_hint_phone" varchar DEFAULT 'Scorri per entrare nel campo ↓';
  ALTER TABLE "_pages_v" ADD COLUMN "version_home_open" varchar DEFAULT 'Apri il ritratto →';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP COLUMN "home_hint_phone";
  ALTER TABLE "pages" DROP COLUMN "home_open";
  ALTER TABLE "_pages_v" DROP COLUMN "version_home_hint_phone";
  ALTER TABLE "_pages_v" DROP COLUMN "version_home_open";`)
}
