import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_testimonials_profiles_network" AS ENUM('instagram', 'tiktok', 'facebook', 'x', 'youtube', 'website');
  CREATE TYPE "public"."enum_testimonials_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__testimonials_v_version_profiles_network" AS ENUM('instagram', 'tiktok', 'facebook', 'x', 'youtube', 'website');
  CREATE TYPE "public"."enum__testimonials_v_version_status" AS ENUM('draft', 'published');
  ALTER TYPE "public"."enum_pages_kind" ADD VALUE 'say' BEFORE 'gate';
  ALTER TYPE "public"."enum__pages_v_version_kind" ADD VALUE 'say' BEFORE 'gate';
  CREATE TABLE "testimonials_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"network" "enum_testimonials_profiles_network" DEFAULT 'instagram',
  	"handle" varchar
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"photo_id" integer,
  	"quote" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_testimonials_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_testimonials_v_version_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"network" "enum__testimonials_v_version_profiles_network" DEFAULT 'instagram',
  	"handle" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_testimonials_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_photo_id" integer,
  	"version_quote" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__testimonials_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "posts" ADD COLUMN "sponsor_name" varchar;
  ALTER TABLE "posts" ADD COLUMN "sponsor_logo_id" integer;
  ALTER TABLE "posts" ADD COLUMN "sponsor_url" varchar;
  ALTER TABLE "posts" ADD COLUMN "sponsor_light_logo" boolean;
  ALTER TABLE "_posts_v" ADD COLUMN "version_sponsor_name" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_sponsor_logo_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_sponsor_url" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_sponsor_light_logo" boolean;
  ALTER TABLE "pages" ADD COLUMN "diary_sponsor" varchar DEFAULT 'In collaborazione con';
  ALTER TABLE "pages" ADD COLUMN "say_kicker" varchar DEFAULT 'Chi è stato davanti all’obiettivo';
  ALTER TABLE "pages" ADD COLUMN "say_question_label" varchar DEFAULT 'La domanda';
  ALTER TABLE "pages" ADD COLUMN "say_question" varchar DEFAULT 'Com’è stato farsi fotografare da Luke?';
  ALTER TABLE "pages" ADD COLUMN "say_alt" varchar DEFAULT 'Foto di {name}';
  ALTER TABLE "pages" ADD COLUMN "say_profiles" varchar DEFAULT 'Profili social';
  ALTER TABLE "pages" ADD COLUMN "say_empty" varchar DEFAULT 'Le prime voci arrivano presto.';
  ALTER TABLE "_pages_v" ADD COLUMN "version_diary_sponsor" varchar DEFAULT 'In collaborazione con';
  ALTER TABLE "_pages_v" ADD COLUMN "version_say_kicker" varchar DEFAULT 'Chi è stato davanti all’obiettivo';
  ALTER TABLE "_pages_v" ADD COLUMN "version_say_question_label" varchar DEFAULT 'La domanda';
  ALTER TABLE "_pages_v" ADD COLUMN "version_say_question" varchar DEFAULT 'Com’è stato farsi fotografare da Luke?';
  ALTER TABLE "_pages_v" ADD COLUMN "version_say_alt" varchar DEFAULT 'Foto di {name}';
  ALTER TABLE "_pages_v" ADD COLUMN "version_say_profiles" varchar DEFAULT 'Profili social';
  ALTER TABLE "_pages_v" ADD COLUMN "version_say_empty" varchar DEFAULT 'Le prime voci arrivano presto.';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "testimonials_profiles" ADD CONSTRAINT "testimonials_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v_version_profiles" ADD CONSTRAINT "_testimonials_v_version_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_testimonials_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_parent_id_testimonials_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "testimonials_profiles_order_idx" ON "testimonials_profiles" USING btree ("_order");
  CREATE INDEX "testimonials_profiles_parent_id_idx" ON "testimonials_profiles" USING btree ("_parent_id");
  CREATE INDEX "testimonials_photo_idx" ON "testimonials" USING btree ("photo_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE INDEX "testimonials__status_idx" ON "testimonials" USING btree ("_status");
  CREATE INDEX "_testimonials_v_version_profiles_order_idx" ON "_testimonials_v_version_profiles" USING btree ("_order");
  CREATE INDEX "_testimonials_v_version_profiles_parent_id_idx" ON "_testimonials_v_version_profiles" USING btree ("_parent_id");
  CREATE INDEX "_testimonials_v_parent_idx" ON "_testimonials_v" USING btree ("parent_id");
  CREATE INDEX "_testimonials_v_version_version_photo_idx" ON "_testimonials_v" USING btree ("version_photo_id");
  CREATE INDEX "_testimonials_v_version_version_updated_at_idx" ON "_testimonials_v" USING btree ("version_updated_at");
  CREATE INDEX "_testimonials_v_version_version_created_at_idx" ON "_testimonials_v" USING btree ("version_created_at");
  CREATE INDEX "_testimonials_v_version_version__status_idx" ON "_testimonials_v" USING btree ("version__status");
  CREATE INDEX "_testimonials_v_created_at_idx" ON "_testimonials_v" USING btree ("created_at");
  CREATE INDEX "_testimonials_v_updated_at_idx" ON "_testimonials_v" USING btree ("updated_at");
  CREATE INDEX "_testimonials_v_latest_idx" ON "_testimonials_v" USING btree ("latest");
  ALTER TABLE "posts" ADD CONSTRAINT "posts_sponsor_logo_id_media_id_fk" FOREIGN KEY ("sponsor_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_sponsor_logo_id_media_id_fk" FOREIGN KEY ("version_sponsor_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_sponsor_sponsor_logo_idx" ON "posts" USING btree ("sponsor_logo_id");
  CREATE INDEX "_posts_v_version_sponsor_version_sponsor_logo_idx" ON "_posts_v" USING btree ("version_sponsor_logo_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "testimonials_profiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_testimonials_v_version_profiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_testimonials_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "testimonials_profiles" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "_testimonials_v_version_profiles" CASCADE;
  DROP TABLE "_testimonials_v" CASCADE;
  ALTER TABLE "posts" DROP CONSTRAINT "posts_sponsor_logo_id_media_id_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_sponsor_logo_id_media_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_testimonials_fk";
  
  ALTER TABLE "pages" ALTER COLUMN "kind" SET DATA TYPE text;
  ALTER TABLE "pages" ALTER COLUMN "kind" SET DEFAULT 'text'::text;
  DROP TYPE "public"."enum_pages_kind";
  CREATE TYPE "public"."enum_pages_kind" AS ENUM('text', 'home', 'about', 'portraits', 'diary', 'gate');
  ALTER TABLE "pages" ALTER COLUMN "kind" SET DEFAULT 'text'::"public"."enum_pages_kind";
  ALTER TABLE "pages" ALTER COLUMN "kind" SET DATA TYPE "public"."enum_pages_kind" USING "kind"::"public"."enum_pages_kind";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_kind" SET DATA TYPE text;
  ALTER TABLE "_pages_v" ALTER COLUMN "version_kind" SET DEFAULT 'text'::text;
  DROP TYPE "public"."enum__pages_v_version_kind";
  CREATE TYPE "public"."enum__pages_v_version_kind" AS ENUM('text', 'home', 'about', 'portraits', 'diary', 'gate');
  ALTER TABLE "_pages_v" ALTER COLUMN "version_kind" SET DEFAULT 'text'::"public"."enum__pages_v_version_kind";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_kind" SET DATA TYPE "public"."enum__pages_v_version_kind" USING "version_kind"::"public"."enum__pages_v_version_kind";
  DROP INDEX "posts_sponsor_sponsor_logo_idx";
  DROP INDEX "_posts_v_version_sponsor_version_sponsor_logo_idx";
  DROP INDEX "payload_locked_documents_rels_testimonials_id_idx";
  ALTER TABLE "posts" DROP COLUMN "sponsor_name";
  ALTER TABLE "posts" DROP COLUMN "sponsor_logo_id";
  ALTER TABLE "posts" DROP COLUMN "sponsor_url";
  ALTER TABLE "posts" DROP COLUMN "sponsor_light_logo";
  ALTER TABLE "_posts_v" DROP COLUMN "version_sponsor_name";
  ALTER TABLE "_posts_v" DROP COLUMN "version_sponsor_logo_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_sponsor_url";
  ALTER TABLE "_posts_v" DROP COLUMN "version_sponsor_light_logo";
  ALTER TABLE "pages" DROP COLUMN "diary_sponsor";
  ALTER TABLE "pages" DROP COLUMN "say_kicker";
  ALTER TABLE "pages" DROP COLUMN "say_question_label";
  ALTER TABLE "pages" DROP COLUMN "say_question";
  ALTER TABLE "pages" DROP COLUMN "say_alt";
  ALTER TABLE "pages" DROP COLUMN "say_profiles";
  ALTER TABLE "pages" DROP COLUMN "say_empty";
  ALTER TABLE "_pages_v" DROP COLUMN "version_diary_sponsor";
  ALTER TABLE "_pages_v" DROP COLUMN "version_say_kicker";
  ALTER TABLE "_pages_v" DROP COLUMN "version_say_question_label";
  ALTER TABLE "_pages_v" DROP COLUMN "version_say_question";
  ALTER TABLE "_pages_v" DROP COLUMN "version_say_alt";
  ALTER TABLE "_pages_v" DROP COLUMN "version_say_profiles";
  ALTER TABLE "_pages_v" DROP COLUMN "version_say_empty";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "testimonials_id";
  DROP TYPE "public"."enum_testimonials_profiles_network";
  DROP TYPE "public"."enum_testimonials_status";
  DROP TYPE "public"."enum__testimonials_v_version_profiles_network";
  DROP TYPE "public"."enum__testimonials_v_version_status";`)
}
