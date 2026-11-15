import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ALTER COLUMN "say_kicker" SET DEFAULT 'Chi ha lavorato con me';
  ALTER TABLE "pages" ALTER COLUMN "say_question" SET DEFAULT 'Com’è stato lavorare con me?';
  ALTER TABLE "_pages_v" ALTER COLUMN "version_say_kicker" SET DEFAULT 'Chi ha lavorato con me';
  ALTER TABLE "_pages_v" ALTER COLUMN "version_say_question" SET DEFAULT 'Com’è stato lavorare con me?';
  ALTER TABLE "testimonials" ADD COLUMN "role" varchar;
  ALTER TABLE "testimonials" ADD COLUMN "question" varchar;
  ALTER TABLE "_testimonials_v" ADD COLUMN "version_role" varchar;
  ALTER TABLE "_testimonials_v" ADD COLUMN "version_question" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ALTER COLUMN "say_kicker" SET DEFAULT 'Chi è stato davanti all’obiettivo';
  ALTER TABLE "pages" ALTER COLUMN "say_question" SET DEFAULT 'Com’è stato farsi fotografare da Luke?';
  ALTER TABLE "_pages_v" ALTER COLUMN "version_say_kicker" SET DEFAULT 'Chi è stato davanti all’obiettivo';
  ALTER TABLE "_pages_v" ALTER COLUMN "version_say_question" SET DEFAULT 'Com’è stato farsi fotografare da Luke?';
  ALTER TABLE "testimonials" DROP COLUMN "role";
  ALTER TABLE "testimonials" DROP COLUMN "question";
  ALTER TABLE "_testimonials_v" DROP COLUMN "version_role";
  ALTER TABLE "_testimonials_v" DROP COLUMN "version_question";`)
}
