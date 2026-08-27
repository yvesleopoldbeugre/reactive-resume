ALTER TABLE "template_preset" ADD COLUMN "kind" text DEFAULT 'resume' NOT NULL;
--> statement-breakpoint
UPDATE "template_preset" SET "kind" = 'cover-letter' WHERE "available_for" = ARRAY['cover-letter']::text[];
--> statement-breakpoint
ALTER TABLE "template_preset" DROP COLUMN "available_for";
