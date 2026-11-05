import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "portraits_meta_description" varchar DEFAULT '{question} Ritratto N° {n} di {siteName}.';
  ALTER TABLE "_pages_v" ADD COLUMN "version_portraits_meta_description" varchar DEFAULT '{question} Ritratto N° {n} di {siteName}.';
  ALTER TABLE "site_settings" ADD COLUMN "job_title" varchar DEFAULT 'Fotografo ritrattista';
  ALTER TABLE "site_settings" ADD COLUMN "google_site_verification" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "bing_site_verification" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP COLUMN "portraits_meta_description";
  ALTER TABLE "_pages_v" DROP COLUMN "version_portraits_meta_description";
  ALTER TABLE "site_settings" DROP COLUMN "job_title";
  ALTER TABLE "site_settings" DROP COLUMN "google_site_verification";
  ALTER TABLE "site_settings" DROP COLUMN "bing_site_verification";`)
}
