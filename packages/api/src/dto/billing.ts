import z from "zod";
import { planIdSchema } from "@reactive-resume/schema/billing/plans";
import { templateSchema } from "@reactive-resume/schema/templates";

const planSchema = z.object({
	id: planIdSchema,
	name: z.string(),
	priceXof: z.number().int().min(0),
	billingPeriod: z.enum(["monthly", "yearly"]).nullable(),
	documentLimit: z.number().int().min(0).nullable(),
	allowedTemplates: z.array(templateSchema).readonly(),
});

export const billingDto = {
	getMySubscription: {
		output: z.object({
			plan: planSchema,
			currentPeriodEnd: z.date().nullable(),
			documentCount: z.number().int().min(0).describe("How many documents (CVs and cover letters) the caller owns."),
		}),
	},

	listPlans: {
		output: z.array(planSchema),
	},

	updatePlan: {
		input: z.object({
			id: planIdSchema.describe("Which plan to edit."),
			name: z.string().trim().min(1).optional(),
			priceXof: z.number().int().min(0).optional(),
			documentLimit: z.number().int().min(0).nullable().optional().describe("null means unlimited."),
			allowedTemplates: z.array(templateSchema).optional(),
		}),
		output: planSchema,
	},

	createCheckout: {
		input: z.object({
			planId: planIdSchema.describe("The paid plan to subscribe to."),
		}),
		output: z.object({
			paymentUrl: z.url().describe("The CinetPay hosted checkout page to redirect the customer to."),
		}),
	},
};
