import type { Plan, PlanId } from "@reactive-resume/schema/billing/plans";
import type { Template } from "@reactive-resume/schema/templates";
import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { db } from "@reactive-resume/db/client";
import * as schema from "@reactive-resume/db/schema";
import { env } from "@reactive-resume/env/server";
import { planCatalog as DEFAULT_PLAN_CATALOG } from "@reactive-resume/schema/billing/plans";
import { templateSchema } from "@reactive-resume/schema/templates";
import { generateId } from "@reactive-resume/utils/string";
import { initiatePayment, verifyTransaction } from "./cinetpay-client";

function addPeriod(from: Date, period: "monthly" | "yearly"): Date {
	const result = new Date(from);
	if (period === "monthly") result.setMonth(result.getMonth() + 1);
	else result.setFullYear(result.getFullYear() + 1);
	return result;
}

function rowToPlan(row: typeof schema.plan.$inferSelect): Plan {
	return {
		id: row.id,
		name: row.name,
		priceXof: row.priceXof,
		billingPeriod: row.billingPeriod,
		documentLimit: row.documentLimit,
		allowedTemplates: row.allowedTemplates,
	};
}

/**
 * The live, admin-editable plan catalog (the `plan` table). Falls back to the static catalog
 * only when the table is genuinely empty — a fresh database whose seed migration hasn't run yet
 * — so the app still has sane defaults rather than failing outright.
 */
async function getPlanCatalog(): Promise<Record<PlanId, Plan>> {
	const rows = await db.select().from(schema.plan);
	if (rows.length === 0) return DEFAULT_PLAN_CATALOG;

	const catalog = {} as Record<PlanId, Plan>;
	for (const row of rows) catalog[row.id] = rowToPlan(row);
	return catalog;
}

async function getPlan(planId: PlanId): Promise<Plan> {
	const catalog = await getPlanCatalog();
	return catalog[planId] ?? DEFAULT_PLAN_CATALOG[planId];
}

/** The effective plan for a user: their active, non-expired subscription, or "free" otherwise. */
export const billingService = {
	getMySubscription: async (input: {
		userId: string;
		isAdmin?: boolean | undefined;
	}): Promise<{ plan: Plan; currentPeriodEnd: Date | null }> => {
		// Admins get every template and no quota as a privilege of the role, not a purchased
		// subscription -- so this is never persisted as a `subscription` row, and deliberately
		// isn't derived from the (admin-editable) "pro-yearly" plan: an admin who narrows what
		// pro-yearly unlocks shouldn't accidentally narrow their own access too.
		if (input.isAdmin) {
			return {
				plan: {
					id: "pro-yearly",
					name: "Administrateur",
					priceXof: 0,
					billingPeriod: null,
					documentLimit: null,
					allowedTemplates: templateSchema.options as Template[],
				},
				currentPeriodEnd: null,
			};
		}

		const [row] = await db
			.select()
			.from(schema.subscription)
			.where(and(eq(schema.subscription.userId, input.userId), eq(schema.subscription.status, "active")));

		if (row && (!row.currentPeriodEnd || row.currentPeriodEnd > new Date())) {
			return { plan: await getPlan(row.planId), currentPeriodEnd: row.currentPeriodEnd };
		}

		return { plan: await getPlan("free"), currentPeriodEnd: null };
	},

	/** Documents currently owned by a user, across both kinds — what the free plan's quota counts against. */
	countDocuments: async (userId: string): Promise<number> => {
		const rows = await db.select({ id: schema.resume.id }).from(schema.resume).where(eq(schema.resume.userId, userId));
		return rows.length;
	},

	listPlans: async (): Promise<Plan[]> => {
		const catalog = await getPlanCatalog();
		return Object.values(catalog);
	},

	/** Admin-only: edits a plan's price, document quota, or unlocked templates. `id`/`billingPeriod` are fixed. */
	updatePlan: async (input: {
		id: PlanId;
		name?: string | undefined;
		priceXof?: number | undefined;
		documentLimit?: number | null | undefined;
		allowedTemplates?: Template[] | undefined;
	}): Promise<Plan> => {
		const [row] = await db
			.update(schema.plan)
			.set({
				...(input.name !== undefined ? { name: input.name } : {}),
				...(input.priceXof !== undefined ? { priceXof: input.priceXof } : {}),
				...(input.documentLimit !== undefined ? { documentLimit: input.documentLimit } : {}),
				...(input.allowedTemplates !== undefined ? { allowedTemplates: input.allowedTemplates } : {}),
			})
			.where(eq(schema.plan.id, input.id))
			.returning();

		if (!row) throw new ORPCError("NOT_FOUND", { message: "Unknown plan." });

		return rowToPlan(row);
	},

	createCheckout: async (input: {
		userId: string;
		planId: PlanId;
		customerName: string;
		customerSurname: string;
		customerEmail: string;
	}) => {
		if (input.planId === "free") {
			throw new ORPCError("BAD_REQUEST", { message: "The free plan has nothing to check out." });
		}

		const plan = await getPlan(input.planId);
		const transactionId = generateId();

		// Call CinetPay first: if it fails (not configured, network error, ...), there must be no
		// "pending" row left behind that doesn't correspond to a real CinetPay-side transaction.
		const { paymentUrl } = await initiatePayment({
			transactionId,
			amount: plan.priceXof,
			currency: "XOF",
			description: `Essor — ${plan.name}`,
			notifyUrl: `${env.APP_URL}/api/webhooks/cinetpay`,
			returnUrl: `${env.APP_URL}/dashboard/settings/billing`,
			customerName: input.customerName,
			customerSurname: input.customerSurname,
			customerEmail: input.customerEmail,
		});

		await db.insert(schema.paymentTransaction).values({
			userId: input.userId,
			planId: input.planId,
			cinetpayTransactionId: transactionId,
			amount: plan.priceXof,
			currency: "XOF",
			status: "pending",
		});

		return { paymentUrl };
	},

	/**
	 * Confirms a CinetPay transaction and, only if CinetPay's own verification accepts it,
	 * activates or renews the corresponding subscription. Never trusts a caller-supplied status —
	 * always re-derives it from `verifyTransaction`, per CinetPay's documented webhook security
	 * model (see `cinetpay-client.ts`).
	 */
	confirmPayment: async (cinetpayTransactionId: string): Promise<{ accepted: boolean }> => {
		const [transaction] = await db
			.select()
			.from(schema.paymentTransaction)
			.where(eq(schema.paymentTransaction.cinetpayTransactionId, cinetpayTransactionId));

		if (!transaction) throw new ORPCError("NOT_FOUND", { message: "Unknown CinetPay transaction." });

		// Already processed (CinetPay may call the webhook more than once for the same transaction).
		if (transaction.status !== "pending") return { accepted: transaction.status === "success" };

		const verification = await verifyTransaction(cinetpayTransactionId);

		await db
			.update(schema.paymentTransaction)
			.set({
				status: verification.accepted ? "success" : "failed",
				cinetpayApiResponseId: verification.raw.api_response_id as string | undefined,
				rawVerification: verification.raw,
			})
			.where(eq(schema.paymentTransaction.id, transaction.id));

		if (!verification.accepted) return { accepted: false };

		const plan = await getPlan(transaction.planId);
		const currentPeriodEnd = plan.billingPeriod ? addPeriod(new Date(), plan.billingPeriod) : null;

		await db
			.insert(schema.subscription)
			.values({ userId: transaction.userId, planId: transaction.planId, status: "active", currentPeriodEnd })
			.onConflictDoUpdate({
				target: schema.subscription.userId,
				set: { planId: transaction.planId, status: "active", currentPeriodEnd },
			});

		return { accepted: true };
	},
};
