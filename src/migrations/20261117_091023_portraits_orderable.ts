import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { generateNKeysBetween } from 'payload/shared'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "portraits" ADD COLUMN "_order" varchar;
  ALTER TABLE "_portraits_v" ADD COLUMN "version__order" varchar;
  CREATE INDEX "portraits__order_idx" ON "portraits" USING btree ("_order");
  CREATE INDEX "_portraits_v_version_version__order_idx" ON "_portraits_v" USING btree ("version__order");`)

  // The portraits keep the order they have now (the old "Order" number, then creation date): each
  // gets its position in the new draggable order, on the portrait and on all its versions.
  const { rows } = await db.execute(
    sql`SELECT "id" FROM "portraits" ORDER BY "order" ASC NULLS LAST, "created_at" ASC, "id" ASC`,
  )
  const keys = generateNKeysBetween(null, null, rows.length)
  for (const [i, row] of rows.entries()) {
    await db.execute(sql`UPDATE "portraits" SET "_order" = ${keys[i]} WHERE "id" = ${row.id}`)
    await db.execute(
      sql`UPDATE "_portraits_v" SET "version__order" = ${keys[i]} WHERE "parent_id" = ${row.id}`,
    )
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "portraits__order_idx";
  DROP INDEX "_portraits_v_version_version__order_idx";
  ALTER TABLE "portraits" DROP COLUMN "_order";
  ALTER TABLE "_portraits_v" DROP COLUMN "version__order";`)
}
