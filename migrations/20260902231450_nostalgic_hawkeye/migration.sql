CREATE TABLE "plan" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"price_xof" integer NOT NULL,
	"billing_period" text,
	"document_limit" integer,
	"allowed_templates" text[] NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
