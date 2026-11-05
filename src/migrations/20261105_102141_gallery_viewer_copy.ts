import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "gate_close" varchar DEFAULT 'Chiudi';
  ALTER TABLE "pages" ADD COLUMN "gate_open_photo" varchar DEFAULT 'Ingrandisci la foto';
  ALTER TABLE "pages" ADD COLUMN "gate_prev_photo" varchar DEFAULT 'Foto precedente';
  ALTER TABLE "pages" ADD COLUMN "gate_next_photo" varchar DEFAULT 'Foto successiva';
  ALTER TABLE "pages" ADD COLUMN "gate_download" varchar DEFAULT 'Scarica';
  ALTER TABLE "pages" ADD COLUMN "gate_counter" varchar DEFAULT '{n} / {total}';
  ALTER TABLE "_pages_v" ADD COLUMN "version_gate_close" varchar DEFAULT 'Chiudi';
  ALTER TABLE "_pages_v" ADD COLUMN "version_gate_open_photo" varchar DEFAULT 'Ingrandisci la foto';
  ALTER TABLE "_pages_v" ADD COLUMN "version_gate_prev_photo" varchar DEFAULT 'Foto precedente';
  ALTER TABLE "_pages_v" ADD COLUMN "version_gate_next_photo" varchar DEFAULT 'Foto successiva';
  ALTER TABLE "_pages_v" ADD COLUMN "version_gate_download" varchar DEFAULT 'Scarica';
  ALTER TABLE "_pages_v" ADD COLUMN "version_gate_counter" varchar DEFAULT '{n} / {total}';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP COLUMN "gate_close";
  ALTER TABLE "pages" DROP COLUMN "gate_open_photo";
  ALTER TABLE "pages" DROP COLUMN "gate_prev_photo";
  ALTER TABLE "pages" DROP COLUMN "gate_next_photo";
  ALTER TABLE "pages" DROP COLUMN "gate_download";
  ALTER TABLE "pages" DROP COLUMN "gate_counter";
  ALTER TABLE "_pages_v" DROP COLUMN "version_gate_close";
  ALTER TABLE "_pages_v" DROP COLUMN "version_gate_open_photo";
  ALTER TABLE "_pages_v" DROP COLUMN "version_gate_prev_photo";
  ALTER TABLE "_pages_v" DROP COLUMN "version_gate_next_photo";
  ALTER TABLE "_pages_v" DROP COLUMN "version_gate_download";
  ALTER TABLE "_pages_v" DROP COLUMN "version_gate_counter";`)
}
