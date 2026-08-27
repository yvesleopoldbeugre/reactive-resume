CREATE TABLE "template_preset" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"base_template" text NOT NULL,
	"config" jsonb NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "template_preset_is_published_created_at_index" ON "template_preset" ("is_published","created_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "template_preset" ADD CONSTRAINT "template_preset_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE CASCADE;