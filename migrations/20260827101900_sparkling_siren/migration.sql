CREATE TABLE "payment_transaction" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"cinetpay_transaction_id" text NOT NULL UNIQUE,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'XOF' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"cinetpay_api_response_id" text,
	"raw_verification" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"current_period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "payment_transaction_user_id_created_at_index" ON "payment_transaction" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_user_id_index" ON "subscription" ("user_id");--> statement-breakpoint
ALTER TABLE "payment_transaction" ADD CONSTRAINT "payment_transaction_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;