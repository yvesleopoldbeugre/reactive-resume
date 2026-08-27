ALTER TABLE "template_preset" ADD COLUMN IF NOT EXISTS "kind" text DEFAULT 'resume' NOT NULL;
--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'template_preset' AND column_name = 'available_for'
	) THEN
		UPDATE "template_preset" SET "kind" = 'cover-letter' WHERE "available_for" = ARRAY['cover-letter']::text[];
	END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "template_preset" DROP COLUMN IF EXISTS "available_for";
