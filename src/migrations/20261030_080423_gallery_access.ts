import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "private_galleries" ADD COLUMN "expires_at" timestamp(3) with time zone;
  ALTER TABLE "private_galleries" ADD COLUMN "access_count" numeric DEFAULT 0;
  ALTER TABLE "private_galleries" ADD COLUMN "last_access_at" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "private_galleries" DROP COLUMN "expires_at";
  ALTER TABLE "private_galleries" DROP COLUMN "access_count";
  ALTER TABLE "private_galleries" DROP COLUMN "last_access_at";`)
}
