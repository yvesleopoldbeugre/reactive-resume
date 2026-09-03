import { adminProcedure, protectedProcedure, publicProcedure, verifiedProcedure } from "../../context";
import { billingDto } from "../../dto/billing";
import { billingService } from "./service";

export const crudRouter = {
	getMySubscription: protectedProcedure
		.route({
			method: "GET",
			path: "/billing/subscription",
			tags: ["Billing"],
			operationId: "getMySubscription",
			summary: "Get my current subscription",
			description:
				"Returns the caller's effective plan (the free plan if they have no active subscription) and, for paid plans, when the current billing period ends.",
			successDescription: "The caller's current plan.",
		})
		.output(billingDto.getMySubscription.output)
		.handler(async ({ context }) => {
			const isAdmin = (context.user as { role?: string | null }).role === "admin";
			const [subscription, documentCount] = await Promise.all([
				billingService.getMySubscription({ userId: context.user.id, isAdmin }),
				billingService.countDocuments(context.user.id),
			]);

			return { ...subscription, documentCount };
		}),

	// Public: the landing page's pricing section shows the same live catalog to signed-out
	// visitors, and pricing/quota/template info isn't sensitive.
	listPlans: publicProcedure
		.route({
			method: "GET",
			path: "/billing/plans",
			tags: ["Billing"],
			operationId: "listBillingPlans",
			summary: "List all subscription plans",
			description: "Returns the full plan catalog: pricing, document quota, and allowed templates for each plan.",
			successDescription: "The plan catalog.",
		})
		.output(billingDto.listPlans.output)
		.handler(async () => {
			return billingService.listPlans();
		}),

	updatePlan: adminProcedure
		.route({
			method: "PUT",
			path: "/billing/plans/{id}",
			tags: ["Billing"],
			operationId: "updateBillingPlan",
			summary: "Update a subscription plan",
			description:
				"Edits a plan's price, document quota, or unlocked templates. The plan id and billing period are fixed. Requires the admin role.",
			successDescription: "The updated plan.",
		})
		.input(billingDto.updatePlan.input)
		.output(billingDto.updatePlan.output)
		.handler(async ({ input }) => {
			return billingService.updatePlan(input);
		}),

	createCheckout: verifiedProcedure
		.route({
			method: "POST",
			path: "/billing/checkout",
			tags: ["Billing"],
			operationId: "createBillingCheckout",
			summary: "Start a CinetPay checkout for a paid plan",
			description:
				"Creates a pending payment transaction and returns a CinetPay hosted payment URL to redirect the customer to. The subscription only activates once CinetPay confirms the payment via webhook.",
			successDescription: "The CinetPay payment URL to redirect to.",
		})
		.input(billingDto.createCheckout.input)
		.output(billingDto.createCheckout.output)
		.handler(async ({ input, context }) => {
			const [firstName = context.user.name, ...rest] = context.user.name.trim().split(/\s+/);

			return billingService.createCheckout({
				userId: context.user.id,
				planId: input.planId,
				customerName: firstName,
				customerSurname: rest.length > 0 ? rest.join(" ") : firstName,
				customerEmail: context.user.email,
			});
		}),
};
