import type { PlanId } from "@reactive-resume/schema/billing/plans";
import * as pg from "drizzle-orm/pg-core";
import { generateId } from "@reactive-resume/utils/string";
import { user } from "./auth";

// A user's current subscription state. Absence of a row means the free plan — there is no row
// created at signup, only once a paid checkout succeeds (or the free plan is later formalized
// with its own row, e.g. after a downgrade). One row per user (enforced by the unique index),
// since a user has exactly one effective plan at a time.
export const subscription = pg.pgTable(
	"subscription",
	{
		id: pg
			.text("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		planId: pg.text("plan_id").notNull().$type<PlanId>(),
		status: pg
			.text("status", { enum: ["active", "expired", "cancelled"] })
			.notNull()
			.default("active"),
		// `null` means the plan never expires on its own (not used by the current catalog, since
		// paid plans always carry a period end and the free plan has no row at all — kept nullable
		// for a future non-expiring paid plan, e.g. a lifetime deal).
		currentPeriodEnd: pg.timestamp("current_period_end", { withTimezone: true }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date()),
	},
	(t) => [pg.uniqueIndex().on(t.userId)],
);

// One row per CinetPay checkout attempt (not per subscription — a user may retry a failed
// payment). `cinetpayTransactionId` is the `transaction_id` we generate and send to CinetPay;
// `rawVerification` keeps the full verification response for audit/debugging.
export const paymentTransaction = pg.pgTable(
	"payment_transaction",
	{
		id: pg
			.text("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		userId: pg
			.text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		planId: pg.text("plan_id").notNull().$type<PlanId>(),
		cinetpayTransactionId: pg.text("cinetpay_transaction_id").notNull().unique(),
		amount: pg.integer("amount").notNull(),
		currency: pg.text("currency").notNull().default("XOF"),
		status: pg
			.text("status", { enum: ["pending", "success", "failed"] })
			.notNull()
			.default("pending"),
		cinetpayApiResponseId: pg.text("cinetpay_api_response_id"),
		rawVerification: pg.jsonb("raw_verification").$type<Record<string, unknown>>(),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date()),
	},
	(t) => [pg.index().on(t.userId, t.createdAt.desc())],
);
