import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "dominant_color" varchar;
  ALTER TABLE "media" ADD COLUMN "exif_taken_at" timestamp(3) with time zone;
  ALTER TABLE "media" ADD COLUMN "exif_camera" varchar;
  ALTER TABLE "media" ADD COLUMN "exif_lens" varchar;
  ALTER TABLE "media" ADD COLUMN "exif_focal_length" varchar;
  ALTER TABLE "media" ADD COLUMN "exif_aperture" varchar;
  ALTER TABLE "media" ADD COLUMN "exif_shutter_speed" varchar;
  ALTER TABLE "media" ADD COLUMN "exif_iso" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_sm_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_sm_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_sm_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_sm_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_sm_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_sm_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_md_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_md_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_md_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_md_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_md_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_md_filename" varchar;
  ALTER TABLE "private_media" ADD COLUMN "sizes_sm_url" varchar;
  ALTER TABLE "private_media" ADD COLUMN "sizes_sm_width" numeric;
  ALTER TABLE "private_media" ADD COLUMN "sizes_sm_height" numeric;
  ALTER TABLE "private_media" ADD COLUMN "sizes_sm_mime_type" varchar;
  ALTER TABLE "private_media" ADD COLUMN "sizes_sm_filesize" numeric;
  ALTER TABLE "private_media" ADD COLUMN "sizes_sm_filename" varchar;
  ALTER TABLE "private_media" ADD COLUMN "sizes_md_url" varchar;
  ALTER TABLE "private_media" ADD COLUMN "sizes_md_width" numeric;
  ALTER TABLE "private_media" ADD COLUMN "sizes_md_height" numeric;
  ALTER TABLE "private_media" ADD COLUMN "sizes_md_mime_type" varchar;
  ALTER TABLE "private_media" ADD COLUMN "sizes_md_filesize" numeric;
  ALTER TABLE "private_media" ADD COLUMN "sizes_md_filename" varchar;
  CREATE INDEX "media_sizes_sm_sizes_sm_filename_idx" ON "media" USING btree ("sizes_sm_filename");
  CREATE INDEX "media_sizes_md_sizes_md_filename_idx" ON "media" USING btree ("sizes_md_filename");
  CREATE INDEX "private_media_sizes_sm_sizes_sm_filename_idx" ON "private_media" USING btree ("sizes_sm_filename");
  CREATE INDEX "private_media_sizes_md_sizes_md_filename_idx" ON "private_media" USING btree ("sizes_md_filename");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "media_sizes_sm_sizes_sm_filename_idx";
  DROP INDEX "media_sizes_md_sizes_md_filename_idx";
  DROP INDEX "private_media_sizes_sm_sizes_sm_filename_idx";
  DROP INDEX "private_media_sizes_md_sizes_md_filename_idx";
  ALTER TABLE "media" DROP COLUMN "dominant_color";
  ALTER TABLE "media" DROP COLUMN "exif_taken_at";
  ALTER TABLE "media" DROP COLUMN "exif_camera";
  ALTER TABLE "media" DROP COLUMN "exif_lens";
  ALTER TABLE "media" DROP COLUMN "exif_focal_length";
  ALTER TABLE "media" DROP COLUMN "exif_aperture";
  ALTER TABLE "media" DROP COLUMN "exif_shutter_speed";
  ALTER TABLE "media" DROP COLUMN "exif_iso";
  ALTER TABLE "media" DROP COLUMN "sizes_sm_url";
  ALTER TABLE "media" DROP COLUMN "sizes_sm_width";
  ALTER TABLE "media" DROP COLUMN "sizes_sm_height";
  ALTER TABLE "media" DROP COLUMN "sizes_sm_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_sm_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_sm_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_md_url";
  ALTER TABLE "media" DROP COLUMN "sizes_md_width";
  ALTER TABLE "media" DROP COLUMN "sizes_md_height";
  ALTER TABLE "media" DROP COLUMN "sizes_md_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_md_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_md_filename";
  ALTER TABLE "private_media" DROP COLUMN "sizes_sm_url";
  ALTER TABLE "private_media" DROP COLUMN "sizes_sm_width";
  ALTER TABLE "private_media" DROP COLUMN "sizes_sm_height";
  ALTER TABLE "private_media" DROP COLUMN "sizes_sm_mime_type";
  ALTER TABLE "private_media" DROP COLUMN "sizes_sm_filesize";
  ALTER TABLE "private_media" DROP COLUMN "sizes_sm_filename";
  ALTER TABLE "private_media" DROP COLUMN "sizes_md_url";
  ALTER TABLE "private_media" DROP COLUMN "sizes_md_width";
  ALTER TABLE "private_media" DROP COLUMN "sizes_md_height";
  ALTER TABLE "private_media" DROP COLUMN "sizes_md_mime_type";
  ALTER TABLE "private_media" DROP COLUMN "sizes_md_filesize";
  ALTER TABLE "private_media" DROP COLUMN "sizes_md_filename";`)
}
