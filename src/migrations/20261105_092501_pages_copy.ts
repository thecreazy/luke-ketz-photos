import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_about_intro_style" AS ENUM('paragraph', 'quote');
  CREATE TYPE "public"."enum_pages_kind" AS ENUM('text', 'home', 'about', 'portraits', 'diary', 'gate');
  CREATE TYPE "public"."enum__pages_v_version_about_intro_style" AS ENUM('paragraph', 'quote');
  CREATE TYPE "public"."enum__pages_v_version_kind" AS ENUM('text', 'home', 'about', 'portraits', 'diary', 'gate');
  CREATE TABLE "pages_about_intro" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"style" "enum_pages_about_intro_style" DEFAULT 'paragraph',
  	"text" varchar
  );
  
  CREATE TABLE "pages_about_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_about_exhibitions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"place" varchar,
  	"year" varchar
  );
  
  CREATE TABLE "_pages_v_version_about_intro" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"style" "enum__pages_v_version_about_intro_style" DEFAULT 'paragraph',
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_about_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_about_exhibitions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"place" varchar,
  	"year" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "about_intro" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_exhibitions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "about_intro" CASCADE;
  DROP TABLE "about_steps" CASCADE;
  DROP TABLE "about_exhibitions" CASCADE;
  DROP TABLE "about" CASCADE;
  ALTER TABLE "pages" ADD COLUMN "kind" "enum_pages_kind" DEFAULT 'text';
  ALTER TABLE "pages" ADD COLUMN "menu_label" varchar;
  ALTER TABLE "pages" ADD COLUMN "menu_order" numeric;
  ALTER TABLE "pages" ADD COLUMN "home_default_question" varchar DEFAULT 'Chi eri prima che te lo dicessero gli altri?';
  ALTER TABLE "pages" ADD COLUMN "home_kicker" varchar DEFAULT 'Una domanda';
  ALTER TABLE "pages" ADD COLUMN "home_question" varchar DEFAULT 'La domanda';
  ALTER TABLE "pages" ADD COLUMN "home_hint" varchar DEFAULT 'Muovi lo sguardo · scorri per entrare nel campo';
  ALTER TABLE "pages" ADD COLUMN "home_near" varchar DEFAULT 'Vicino';
  ALTER TABLE "pages" ADD COLUMN "home_far" varchar DEFAULT 'Lontano';
  ALTER TABLE "pages" ADD COLUMN "home_counter" varchar DEFAULT '{faces} volti · {questions} domande';
  ALTER TABLE "pages" ADD COLUMN "home_about_card" varchar DEFAULT 'Chi è Luke';
  ALTER TABLE "pages" ADD COLUMN "home_about_question" varchar DEFAULT 'Chi c’è dietro l’obiettivo?';
  ALTER TABLE "pages" ADD COLUMN "about_kicker" varchar DEFAULT 'Chi è Luke · Ritrattista concettuale · Piacenza';
  ALTER TABLE "pages" ADD COLUMN "about_headline" varchar DEFAULT 'Raccontare è semplice. *Emozionare* è un altro discorso.';
  ALTER TABLE "pages" ADD COLUMN "about_portrait_id" integer;
  ALTER TABLE "pages" ADD COLUMN "about_steps_title" varchar DEFAULT 'Come nasce un ritratto';
  ALTER TABLE "pages" ADD COLUMN "about_exhibitions_title" varchar DEFAULT 'Mostre';
  ALTER TABLE "pages" ADD COLUMN "about_contact_label" varchar DEFAULT 'Scrivimi →';
  ALTER TABLE "pages" ADD COLUMN "about_commission_note" varchar DEFAULT 'Su commissione · matrimoni e ritratti privati';
  ALTER TABLE "pages" ADD COLUMN "portraits_all" varchar DEFAULT 'Tutti';
  ALTER TABLE "pages" ADD COLUMN "portraits_single" varchar DEFAULT 'Ritratti singoli';
  ALTER TABLE "pages" ADD COLUMN "portraits_series" varchar DEFAULT 'Serie';
  ALTER TABLE "pages" ADD COLUMN "portraits_more" varchar DEFAULT 'Altri ritratti ↓';
  ALTER TABLE "pages" ADD COLUMN "portraits_aria" varchar DEFAULT 'Tutti i ritratti';
  ALTER TABLE "pages" ADD COLUMN "portraits_alt" varchar DEFAULT 'Ritratto N° {n}';
  ALTER TABLE "pages" ADD COLUMN "portraits_empty" varchar DEFAULT 'I primi ritratti arrivano presto.';
  ALTER TABLE "pages" ADD COLUMN "portraits_back" varchar DEFAULT '← Torna nel campo';
  ALTER TABLE "pages" ADD COLUMN "portraits_back_prev" varchar DEFAULT '← Indietro';
  ALTER TABLE "pages" ADD COLUMN "portraits_prev" varchar DEFAULT '← Volto precedente';
  ALTER TABLE "pages" ADD COLUMN "portraits_next" varchar DEFAULT 'Volto successivo →';
  ALTER TABLE "pages" ADD COLUMN "diary_subtitle" varchar DEFAULT 'Quello che succede prima e dopo lo scatto';
  ALTER TABLE "pages" ADD COLUMN "diary_latest" varchar DEFAULT 'Ultima pagina';
  ALTER TABLE "pages" ADD COLUMN "diary_read" varchar DEFAULT 'Leggi →';
  ALTER TABLE "pages" ADD COLUMN "diary_roll" varchar DEFAULT 'Il rullino · tutte le pagine';
  ALTER TABLE "pages" ADD COLUMN "diary_filter" varchar DEFAULT 'Filtra per tema';
  ALTER TABLE "pages" ADD COLUMN "diary_all" varchar DEFAULT 'Tutti';
  ALTER TABLE "pages" ADD COLUMN "diary_prev" varchar DEFAULT 'Fotogrammi precedenti';
  ALTER TABLE "pages" ADD COLUMN "diary_next" varchar DEFAULT 'Fotogrammi successivi';
  ALTER TABLE "pages" ADD COLUMN "diary_no_photo" varchar DEFAULT 'Pagina senza foto';
  ALTER TABLE "pages" ADD COLUMN "diary_next_page" varchar DEFAULT 'Pagina successiva';
  ALTER TABLE "pages" ADD COLUMN "diary_minutes" varchar DEFAULT '{n} min';
  ALTER TABLE "pages" ADD COLUMN "diary_photos" varchar DEFAULT '{n} fotografie';
  ALTER TABLE "pages" ADD COLUMN "diary_empty" varchar DEFAULT 'Le prime pagine del diario arrivano presto.';
  ALTER TABLE "pages" ADD COLUMN "diary_theme_vita" varchar DEFAULT 'Vita da fotografo';
  ALTER TABLE "pages" ADD COLUMN "diary_theme_mostre" varchar DEFAULT 'Mostre';
  ALTER TABLE "pages" ADD COLUMN "diary_theme_dietro" varchar DEFAULT 'Dietro il ritratto';
  ALTER TABLE "pages" ADD COLUMN "gate_kicker" varchar DEFAULT 'Fuori fuoco';
  ALTER TABLE "pages" ADD COLUMN "gate_title" varchar DEFAULT 'Questa stanza si mette a fuoco con una parola.';
  ALTER TABLE "pages" ADD COLUMN "gate_hint" varchar DEFAULT 'Te l’ha data Luke. Se non la ricordi, scrivigli.';
  ALTER TABLE "pages" ADD COLUMN "gate_label" varchar DEFAULT 'Parola d’accesso';
  ALTER TABLE "pages" ADD COLUMN "gate_placeholder" varchar DEFAULT 'La parola';
  ALTER TABLE "pages" ADD COLUMN "gate_submit" varchar DEFAULT 'Metti a fuoco';
  ALTER TABLE "pages" ADD COLUMN "gate_wrong" varchar DEFAULT 'Ancora sfocato. Riprova.';
  ALTER TABLE "pages" ADD COLUMN "gate_too_many" varchar DEFAULT 'Troppi tentativi. Riprova tra qualche minuto.';
  ALTER TABLE "pages" ADD COLUMN "gate_private" varchar DEFAULT 'Galleria privata';
  ALTER TABLE "pages" ADD COLUMN "gate_open" varchar DEFAULT 'A fuoco';
  ALTER TABLE "pages" ADD COLUMN "gate_expired" varchar DEFAULT 'Questa galleria non è più disponibile. Scrivi a Luke.';
  ALTER TABLE "_pages_v" ADD COLUMN "version_kind" "enum__pages_v_version_kind" DEFAULT 'text';
  ALTER TABLE "_pages_v" ADD COLUMN "version_menu_label" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_menu_order" numeric;
  ALTER TABLE "_pages_v" ADD COLUMN "version_home_default_question" varchar DEFAULT 'Chi eri prima che te lo dicessero gli altri?';
  ALTER TABLE "_pages_v" ADD COLUMN "version_home_kicker" varchar DEFAULT 'Una domanda';
  ALTER TABLE "_pages_v" ADD COLUMN "version_home_question" varchar DEFAULT 'La domanda';
  ALTER TABLE "_pages_v" ADD COLUMN "version_home_hint" varchar DEFAULT 'Muovi lo sguardo · scorri per entrare nel campo';
  ALTER TABLE "_pages_v" ADD COLUMN "version_home_near" varchar DEFAULT 'Vicino';
  ALTER TABLE "_pages_v" ADD COLUMN "version_home_far" varchar DEFAULT 'Lontano';
  ALTER TABLE "_pages_v" ADD COLUMN "version_home_counter" varchar DEFAULT '{faces} volti · {questions} domande';
  ALTER TABLE "_pages_v" ADD COLUMN "version_home_about_card" varchar DEFAULT 'Chi è Luke';
  ALTER TABLE "_pages_v" ADD COLUMN "version_home_about_question" varchar DEFAULT 'Chi c’è dietro l’obiettivo?';
  ALTER TABLE "_pages_v" ADD COLUMN "version_about_kicker" varchar DEFAULT 'Chi è Luke · Ritrattista concettuale · Piacenza';
  ALTER TABLE "_pages_v" ADD COLUMN "version_about_headline" varchar DEFAULT 'Raccontare è semplice. *Emozionare* è un altro discorso.';
  ALTER TABLE "_pages_v" ADD COLUMN "version_about_portrait_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_about_steps_title" varchar DEFAULT 'Come nasce un ritratto';
  ALTER TABLE "_pages_v" ADD COLUMN "version_about_exhibitions_title" varchar DEFAULT 'Mostre';
  ALTER TABLE "_pages_v" ADD COLUMN "version_about_contact_label" varchar DEFAULT 'Scrivimi →';
  ALTER TABLE "_pages_v" ADD COLUMN "version_about_commission_note" varchar DEFAULT 'Su commissione · matrimoni e ritratti privati';
  ALTER TABLE "_pages_v" ADD COLUMN "version_portraits_all" varchar DEFAULT 'Tutti';
  ALTER TABLE "_pages_v" ADD COLUMN "version_portraits_single" varchar DEFAULT 'Ritratti singoli';
  ALTER TABLE "_pages_v" ADD COLUMN "version_portraits_series" varchar DEFAULT 'Serie';
  ALTER TABLE "_pages_v" ADD COLUMN "version_portraits_more" varchar DEFAULT 'Altri ritratti ↓';
  ALTER TABLE "_pages_v" ADD COLUMN "version_portraits_aria" varchar DEFAULT 'Tutti i ritratti';
  ALTER TABLE "_pages_v" ADD COLUMN "version_portraits_alt" varchar DEFAULT 'Ritratto N° {n}';
  ALTER TABLE "_pages_v" ADD COLUMN "version_portraits_empty" varchar DEFAULT 'I primi ritratti arrivano presto.';
  ALTER TABLE "_pages_v" ADD COLUMN "version_portraits_back" varchar DEFAULT '← Torna nel campo';
  ALTER TABLE "_pages_v" ADD COLUMN "version_portraits_back_prev" varchar DEFAULT '← Indietro';
  ALTER TABLE "_pages_v" ADD COLUMN "version_portraits_prev" varchar DEFAULT '← Volto precedente';
  ALTER TABLE "_pages_v" ADD COLUMN "version_portraits_next" varchar DEFAULT 'Volto successivo →';
  ALTER TABLE "_pages_v" ADD COLUMN "version_diary_subtitle" varchar DEFAULT 'Quello che succede prima e dopo lo scatto';
  ALTER TABLE "_pages_v" ADD COLUMN "version_diary_latest" varchar DEFAULT 'Ultima pagina';
  ALTER TABLE "_pages_v" ADD COLUMN "version_diary_read" varchar DEFAULT 'Leggi →';
  ALTER TABLE "_pages_v" ADD COLUMN "version_diary_roll" varchar DEFAULT 'Il rullino · tutte le pagine';
  ALTER TABLE "_pages_v" ADD COLUMN "version_diary_filter" varchar DEFAULT 'Filtra per tema';
  ALTER TABLE "_pages_v" ADD COLUMN "version_diary_all" varchar DEFAULT 'Tutti';
  ALTER TABLE "_pages_v" ADD COLUMN "version_diary_prev" varchar DEFAULT 'Fotogrammi precedenti';
  ALTER TABLE "_pages_v" ADD COLUMN "version_diary_next" varchar DEFAULT 'Fotogrammi successivi';
  ALTER TABLE "_pages_v" ADD COLUMN "version_diary_no_photo" varchar DEFAULT 'Pagina senza foto';
  ALTER TABLE "_pages_v" ADD COLUMN "version_diary_next_page" varchar DEFAULT 'Pagina successiva';
  ALTER TABLE "_pages_v" ADD COLUMN "version_diary_minutes" varchar DEFAULT '{n} min';
  ALTER TABLE "_pages_v" ADD COLUMN "version_diary_photos" varchar DEFAULT '{n} fotografie';
  ALTER TABLE "_pages_v" ADD COLUMN "version_diary_empty" varchar DEFAULT 'Le prime pagine del diario arrivano presto.';
  ALTER TABLE "_pages_v" ADD COLUMN "version_diary_theme_vita" varchar DEFAULT 'Vita da fotografo';
  ALTER TABLE "_pages_v" ADD COLUMN "version_diary_theme_mostre" varchar DEFAULT 'Mostre';
  ALTER TABLE "_pages_v" ADD COLUMN "version_diary_theme_dietro" varchar DEFAULT 'Dietro il ritratto';
  ALTER TABLE "_pages_v" ADD COLUMN "version_gate_kicker" varchar DEFAULT 'Fuori fuoco';
  ALTER TABLE "_pages_v" ADD COLUMN "version_gate_title" varchar DEFAULT 'Questa stanza si mette a fuoco con una parola.';
  ALTER TABLE "_pages_v" ADD COLUMN "version_gate_hint" varchar DEFAULT 'Te l’ha data Luke. Se non la ricordi, scrivigli.';
  ALTER TABLE "_pages_v" ADD COLUMN "version_gate_label" varchar DEFAULT 'Parola d’accesso';
  ALTER TABLE "_pages_v" ADD COLUMN "version_gate_placeholder" varchar DEFAULT 'La parola';
  ALTER TABLE "_pages_v" ADD COLUMN "version_gate_submit" varchar DEFAULT 'Metti a fuoco';
  ALTER TABLE "_pages_v" ADD COLUMN "version_gate_wrong" varchar DEFAULT 'Ancora sfocato. Riprova.';
  ALTER TABLE "_pages_v" ADD COLUMN "version_gate_too_many" varchar DEFAULT 'Troppi tentativi. Riprova tra qualche minuto.';
  ALTER TABLE "_pages_v" ADD COLUMN "version_gate_private" varchar DEFAULT 'Galleria privata';
  ALTER TABLE "_pages_v" ADD COLUMN "version_gate_open" varchar DEFAULT 'A fuoco';
  ALTER TABLE "_pages_v" ADD COLUMN "version_gate_expired" varchar DEFAULT 'Questa galleria non è più disponibile. Scrivi a Luke.';
  ALTER TABLE "site_settings" ADD COLUMN "footer_note" varchar DEFAULT 'Tutti i diritti riservati';
  ALTER TABLE "pages_about_intro" ADD CONSTRAINT "pages_about_intro_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_about_steps" ADD CONSTRAINT "pages_about_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_about_exhibitions" ADD CONSTRAINT "pages_about_exhibitions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_about_intro" ADD CONSTRAINT "_pages_v_version_about_intro_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_about_steps" ADD CONSTRAINT "_pages_v_version_about_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_about_exhibitions" ADD CONSTRAINT "_pages_v_version_about_exhibitions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_about_intro_order_idx" ON "pages_about_intro" USING btree ("_order");
  CREATE INDEX "pages_about_intro_parent_id_idx" ON "pages_about_intro" USING btree ("_parent_id");
  CREATE INDEX "pages_about_steps_order_idx" ON "pages_about_steps" USING btree ("_order");
  CREATE INDEX "pages_about_steps_parent_id_idx" ON "pages_about_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_about_exhibitions_order_idx" ON "pages_about_exhibitions" USING btree ("_order");
  CREATE INDEX "pages_about_exhibitions_parent_id_idx" ON "pages_about_exhibitions" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_about_intro_order_idx" ON "_pages_v_version_about_intro" USING btree ("_order");
  CREATE INDEX "_pages_v_version_about_intro_parent_id_idx" ON "_pages_v_version_about_intro" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_about_steps_order_idx" ON "_pages_v_version_about_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_version_about_steps_parent_id_idx" ON "_pages_v_version_about_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_about_exhibitions_order_idx" ON "_pages_v_version_about_exhibitions" USING btree ("_order");
  CREATE INDEX "_pages_v_version_about_exhibitions_parent_id_idx" ON "_pages_v_version_about_exhibitions" USING btree ("_parent_id");
  ALTER TABLE "pages" ADD CONSTRAINT "pages_about_portrait_id_media_id_fk" FOREIGN KEY ("about_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_about_portrait_id_media_id_fk" FOREIGN KEY ("version_about_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_about_about_portrait_idx" ON "pages" USING btree ("about_portrait_id");
  CREATE INDEX "_pages_v_version_about_version_about_portrait_idx" ON "_pages_v" USING btree ("version_about_portrait_id");
  ALTER TABLE "site_settings" DROP COLUMN "tagline";
  DROP TYPE "public"."enum_about_intro_style";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_about_intro_style" AS ENUM('paragraph', 'quote');
  CREATE TABLE "about_intro" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"style" "enum_about_intro_style" DEFAULT 'paragraph',
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "about_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "about_exhibitions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"place" varchar,
  	"year" varchar
  );
  
  CREATE TABLE "about" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar DEFAULT 'Chi è Luke · Ritrattista concettuale · Piacenza',
  	"headline" varchar DEFAULT 'Raccontare è semplice. *Emozionare* è un altro discorso.' NOT NULL,
  	"portrait_id" integer,
  	"steps_title" varchar DEFAULT 'Come nasce un ritratto',
  	"commission_note" varchar DEFAULT 'Su commissione · matrimoni e ritratti privati',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "pages_about_intro" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_about_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_about_exhibitions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_about_intro" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_about_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_about_exhibitions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_about_intro" CASCADE;
  DROP TABLE "pages_about_steps" CASCADE;
  DROP TABLE "pages_about_exhibitions" CASCADE;
  DROP TABLE "_pages_v_version_about_intro" CASCADE;
  DROP TABLE "_pages_v_version_about_steps" CASCADE;
  DROP TABLE "_pages_v_version_about_exhibitions" CASCADE;
  ALTER TABLE "pages" DROP CONSTRAINT "pages_about_portrait_id_media_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_about_portrait_id_media_id_fk";
  
  DROP INDEX "pages_about_about_portrait_idx";
  DROP INDEX "_pages_v_version_about_version_about_portrait_idx";
  ALTER TABLE "site_settings" ADD COLUMN "tagline" varchar;
  ALTER TABLE "about_intro" ADD CONSTRAINT "about_intro_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_steps" ADD CONSTRAINT "about_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_exhibitions" ADD CONSTRAINT "about_exhibitions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about" ADD CONSTRAINT "about_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "about_intro_order_idx" ON "about_intro" USING btree ("_order");
  CREATE INDEX "about_intro_parent_id_idx" ON "about_intro" USING btree ("_parent_id");
  CREATE INDEX "about_steps_order_idx" ON "about_steps" USING btree ("_order");
  CREATE INDEX "about_steps_parent_id_idx" ON "about_steps" USING btree ("_parent_id");
  CREATE INDEX "about_exhibitions_order_idx" ON "about_exhibitions" USING btree ("_order");
  CREATE INDEX "about_exhibitions_parent_id_idx" ON "about_exhibitions" USING btree ("_parent_id");
  CREATE INDEX "about_portrait_idx" ON "about" USING btree ("portrait_id");
  ALTER TABLE "pages" DROP COLUMN "kind";
  ALTER TABLE "pages" DROP COLUMN "menu_label";
  ALTER TABLE "pages" DROP COLUMN "menu_order";
  ALTER TABLE "pages" DROP COLUMN "home_default_question";
  ALTER TABLE "pages" DROP COLUMN "home_kicker";
  ALTER TABLE "pages" DROP COLUMN "home_question";
  ALTER TABLE "pages" DROP COLUMN "home_hint";
  ALTER TABLE "pages" DROP COLUMN "home_near";
  ALTER TABLE "pages" DROP COLUMN "home_far";
  ALTER TABLE "pages" DROP COLUMN "home_counter";
  ALTER TABLE "pages" DROP COLUMN "home_about_card";
  ALTER TABLE "pages" DROP COLUMN "home_about_question";
  ALTER TABLE "pages" DROP COLUMN "about_kicker";
  ALTER TABLE "pages" DROP COLUMN "about_headline";
  ALTER TABLE "pages" DROP COLUMN "about_portrait_id";
  ALTER TABLE "pages" DROP COLUMN "about_steps_title";
  ALTER TABLE "pages" DROP COLUMN "about_exhibitions_title";
  ALTER TABLE "pages" DROP COLUMN "about_contact_label";
  ALTER TABLE "pages" DROP COLUMN "about_commission_note";
  ALTER TABLE "pages" DROP COLUMN "portraits_all";
  ALTER TABLE "pages" DROP COLUMN "portraits_single";
  ALTER TABLE "pages" DROP COLUMN "portraits_series";
  ALTER TABLE "pages" DROP COLUMN "portraits_more";
  ALTER TABLE "pages" DROP COLUMN "portraits_aria";
  ALTER TABLE "pages" DROP COLUMN "portraits_alt";
  ALTER TABLE "pages" DROP COLUMN "portraits_empty";
  ALTER TABLE "pages" DROP COLUMN "portraits_back";
  ALTER TABLE "pages" DROP COLUMN "portraits_back_prev";
  ALTER TABLE "pages" DROP COLUMN "portraits_prev";
  ALTER TABLE "pages" DROP COLUMN "portraits_next";
  ALTER TABLE "pages" DROP COLUMN "diary_subtitle";
  ALTER TABLE "pages" DROP COLUMN "diary_latest";
  ALTER TABLE "pages" DROP COLUMN "diary_read";
  ALTER TABLE "pages" DROP COLUMN "diary_roll";
  ALTER TABLE "pages" DROP COLUMN "diary_filter";
  ALTER TABLE "pages" DROP COLUMN "diary_all";
  ALTER TABLE "pages" DROP COLUMN "diary_prev";
  ALTER TABLE "pages" DROP COLUMN "diary_next";
  ALTER TABLE "pages" DROP COLUMN "diary_no_photo";
  ALTER TABLE "pages" DROP COLUMN "diary_next_page";
  ALTER TABLE "pages" DROP COLUMN "diary_minutes";
  ALTER TABLE "pages" DROP COLUMN "diary_photos";
  ALTER TABLE "pages" DROP COLUMN "diary_empty";
  ALTER TABLE "pages" DROP COLUMN "diary_theme_vita";
  ALTER TABLE "pages" DROP COLUMN "diary_theme_mostre";
  ALTER TABLE "pages" DROP COLUMN "diary_theme_dietro";
  ALTER TABLE "pages" DROP COLUMN "gate_kicker";
  ALTER TABLE "pages" DROP COLUMN "gate_title";
  ALTER TABLE "pages" DROP COLUMN "gate_hint";
  ALTER TABLE "pages" DROP COLUMN "gate_label";
  ALTER TABLE "pages" DROP COLUMN "gate_placeholder";
  ALTER TABLE "pages" DROP COLUMN "gate_submit";
  ALTER TABLE "pages" DROP COLUMN "gate_wrong";
  ALTER TABLE "pages" DROP COLUMN "gate_too_many";
  ALTER TABLE "pages" DROP COLUMN "gate_private";
  ALTER TABLE "pages" DROP COLUMN "gate_open";
  ALTER TABLE "pages" DROP COLUMN "gate_expired";
  ALTER TABLE "_pages_v" DROP COLUMN "version_kind";
  ALTER TABLE "_pages_v" DROP COLUMN "version_menu_label";
  ALTER TABLE "_pages_v" DROP COLUMN "version_menu_order";
  ALTER TABLE "_pages_v" DROP COLUMN "version_home_default_question";
  ALTER TABLE "_pages_v" DROP COLUMN "version_home_kicker";
  ALTER TABLE "_pages_v" DROP COLUMN "version_home_question";
  ALTER TABLE "_pages_v" DROP COLUMN "version_home_hint";
  ALTER TABLE "_pages_v" DROP COLUMN "version_home_near";
  ALTER TABLE "_pages_v" DROP COLUMN "version_home_far";
  ALTER TABLE "_pages_v" DROP COLUMN "version_home_counter";
  ALTER TABLE "_pages_v" DROP COLUMN "version_home_about_card";
  ALTER TABLE "_pages_v" DROP COLUMN "version_home_about_question";
  ALTER TABLE "_pages_v" DROP COLUMN "version_about_kicker";
  ALTER TABLE "_pages_v" DROP COLUMN "version_about_headline";
  ALTER TABLE "_pages_v" DROP COLUMN "version_about_portrait_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_about_steps_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_about_exhibitions_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_about_contact_label";
  ALTER TABLE "_pages_v" DROP COLUMN "version_about_commission_note";
  ALTER TABLE "_pages_v" DROP COLUMN "version_portraits_all";
  ALTER TABLE "_pages_v" DROP COLUMN "version_portraits_single";
  ALTER TABLE "_pages_v" DROP COLUMN "version_portraits_series";
  ALTER TABLE "_pages_v" DROP COLUMN "version_portraits_more";
  ALTER TABLE "_pages_v" DROP COLUMN "version_portraits_aria";
  ALTER TABLE "_pages_v" DROP COLUMN "version_portraits_alt";
  ALTER TABLE "_pages_v" DROP COLUMN "version_portraits_empty";
  ALTER TABLE "_pages_v" DROP COLUMN "version_portraits_back";
  ALTER TABLE "_pages_v" DROP COLUMN "version_portraits_back_prev";
  ALTER TABLE "_pages_v" DROP COLUMN "version_portraits_prev";
  ALTER TABLE "_pages_v" DROP COLUMN "version_portraits_next";
  ALTER TABLE "_pages_v" DROP COLUMN "version_diary_subtitle";
  ALTER TABLE "_pages_v" DROP COLUMN "version_diary_latest";
  ALTER TABLE "_pages_v" DROP COLUMN "version_diary_read";
  ALTER TABLE "_pages_v" DROP COLUMN "version_diary_roll";
  ALTER TABLE "_pages_v" DROP COLUMN "version_diary_filter";
  ALTER TABLE "_pages_v" DROP COLUMN "version_diary_all";
  ALTER TABLE "_pages_v" DROP COLUMN "version_diary_prev";
  ALTER TABLE "_pages_v" DROP COLUMN "version_diary_next";
  ALTER TABLE "_pages_v" DROP COLUMN "version_diary_no_photo";
  ALTER TABLE "_pages_v" DROP COLUMN "version_diary_next_page";
  ALTER TABLE "_pages_v" DROP COLUMN "version_diary_minutes";
  ALTER TABLE "_pages_v" DROP COLUMN "version_diary_photos";
  ALTER TABLE "_pages_v" DROP COLUMN "version_diary_empty";
  ALTER TABLE "_pages_v" DROP COLUMN "version_diary_theme_vita";
  ALTER TABLE "_pages_v" DROP COLUMN "version_diary_theme_mostre";
  ALTER TABLE "_pages_v" DROP COLUMN "version_diary_theme_dietro";
  ALTER TABLE "_pages_v" DROP COLUMN "version_gate_kicker";
  ALTER TABLE "_pages_v" DROP COLUMN "version_gate_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_gate_hint";
  ALTER TABLE "_pages_v" DROP COLUMN "version_gate_label";
  ALTER TABLE "_pages_v" DROP COLUMN "version_gate_placeholder";
  ALTER TABLE "_pages_v" DROP COLUMN "version_gate_submit";
  ALTER TABLE "_pages_v" DROP COLUMN "version_gate_wrong";
  ALTER TABLE "_pages_v" DROP COLUMN "version_gate_too_many";
  ALTER TABLE "_pages_v" DROP COLUMN "version_gate_private";
  ALTER TABLE "_pages_v" DROP COLUMN "version_gate_open";
  ALTER TABLE "_pages_v" DROP COLUMN "version_gate_expired";
  ALTER TABLE "site_settings" DROP COLUMN "footer_note";
  DROP TYPE "public"."enum_pages_about_intro_style";
  DROP TYPE "public"."enum_pages_kind";
  DROP TYPE "public"."enum__pages_v_version_about_intro_style";
  DROP TYPE "public"."enum__pages_v_version_kind";`)
}
