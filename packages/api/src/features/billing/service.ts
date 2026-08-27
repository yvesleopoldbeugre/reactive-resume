import type { Plan, PlanId } from "@reactive-resume/schema/billing/plans";
import { ORPCError } from "@orpc/client";
import { and, eq } from "drizzle-orm";
import { db } from "@reactive-resume/db/client";
import * as schema from "@reactive-resume/db/schema";
import { env } from "@reactive-resume/env/server";
import { getPlan, planCatalog } from "@reactive-resume/schema/billing/plans";
import { generateId } from "@reactive-resume/utils/string";
import { initiatePayment, verifyTransaction } from "./cinetpay-client";

function addPeriod(from: Date, period: "monthly" | "yearly"): Date {
	const result = new Date(from);
	if (period === "monthly") result.setMonth(result.getMonth() + 1);
	else result.setFullYear(result.getFullYear() + 1);
	return result;
}

/** The effective plan for a user: their active, non-expired subscription, or "free" otherwise. */
export const billingService = {
	getMySubscription: async (input: { userId: string }): Promise<{ plan: Plan; currentPeriodEnd: Date | null }> => {
		const [row] = await db
			.select()
			.from(schema.subscription)
			.where(and(eq(schema.subscription.userId, input.userId), eq(schema.subscription.status, "active")));

		if (row && (!row.currentPeriodEnd || row.currentPeriodEnd > new Date())) {
			return { plan: getPlan(row.planId), currentPeriodEnd: row.currentPeriodEnd };
		}

		return { plan: getPlan("free"), currentPeriodEnd: null };
	},

	/** Documents currently owned by a user, across both kinds — what the free plan's quota counts against. */
	countDocuments: async (userId: string): Promise<number> => {
		const rows = await db.select({ id: schema.resume.id }).from(schema.resume).where(eq(schema.resume.userId, userId));
		return rows.length;
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

		const plan = getPlan(input.planId);
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

		const plan = getPlan(transaction.planId);
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

export function listPlans(): Plan[] {
	return Object.values(planCatalog);
}
