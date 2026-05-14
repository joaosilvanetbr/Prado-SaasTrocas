CREATE TABLE "daily_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"valor_realizado" real NOT NULL,
	"valor_meta" real NOT NULL,
	"sector_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sectors" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"comprador_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"setores" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_nome_unique" UNIQUE("nome"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "daily_reports" ADD CONSTRAINT "daily_reports_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sectors" ADD CONSTRAINT "sectors_comprador_id_users_id_fk" FOREIGN KEY ("comprador_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;