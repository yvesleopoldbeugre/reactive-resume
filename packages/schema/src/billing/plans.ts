import type { Template } from "../templates";
import z from "zod";

export const planIdSchema = z.enum(["free", "pro-monthly", "pro-yearly"]);
export type PlanId = z.infer<typeof planIdSchema>;

export type Plan = {
	id: PlanId;
	name: string;
	/** Price in XOF (West African CFA franc, whole units — no decimal subunit in circulation). */
	priceXof: number;
	billingPeriod: "monthly" | "yearly" | null;
	/** `null` means unlimited. */
	documentLimit: number | null;
	allowedTemplates: readonly Template[];
};

const FREE_TEMPLATES: readonly Template[] = ["azurill", "bronzor", "onyx", "kakuna", "eevee", "vulpix"];

const ALL_TEMPLATES: readonly Template[] = [
	"azurill",
	"bronzor",
	"chikorita",
	"custom",
	"ditgar",
	"ditto",
	"eevee",
	"espeon",
	"gengar",
	"glalie",
	"kakuna",
	"lapras",
	"leafish",
	"meowth",
	"onyx",
	"pikachu",
	"rhyhorn",
	"scizor",
	"snorlax",
	"togepi",
	"vulpix",
];

/**
 * The subscription tier catalog — a small, deploy-editable set, not a DB table (unlike template
 * presets, which are admin-curated content). A user's *subscription* (which plan, since when) is
 * still tracked in the database (`packages/db/src/schema/billing.ts`); this catalog is just the
 * static definition of what each plan id means.
 */
export const planCatalog: Record<PlanId, Plan> = {
	free: {
		id: "free",
		name: "Gratuit",
		priceXof: 0,
		billingPeriod: null,
		documentLimit: 3,
		allowedTemplates: FREE_TEMPLATES,
	},
	"pro-monthly": {
		id: "pro-monthly",
		name: "Pro mensuel",
		priceXof: 2500,
		billingPeriod: "monthly",
		documentLimit: null,
		allowedTemplates: ALL_TEMPLATES,
	},
	"pro-yearly": {
		id: "pro-yearly",
		name: "Pro annuel",
		priceXof: 25000,
		billingPeriod: "yearly",
		documentLimit: null,
		allowedTemplates: ALL_TEMPLATES,
	},
};

export function getPlan(planId: PlanId): Plan {
	return planCatalog[planId];
}

export function isTemplateAllowedForPlan(planId: PlanId, template: Template): boolean {
	return planCatalog[planId].allowedTemplates.includes(template);
}
