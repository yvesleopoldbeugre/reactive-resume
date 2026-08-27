import { describe, expect, it } from "vitest";
import { templateSchema } from "../templates";
import { getPlan, isTemplateAllowedForPlan, planCatalog, planIdSchema } from "./plans";

describe("planCatalog", () => {
	it("has an entry for every declared plan id", () => {
		for (const planId of planIdSchema.options) {
			expect(planCatalog[planId], planId).toBeDefined();
			expect(planCatalog[planId].id).toBe(planId);
		}
	});

	it("only lists real templates in allowedTemplates", () => {
		const validTemplates = new Set(templateSchema.options);
		for (const [planId, plan] of Object.entries(planCatalog)) {
			for (const template of plan.allowedTemplates) {
				expect(validTemplates.has(template), `${planId}: ${template}`).toBe(true);
			}
		}
	});

	it("gives the free plan a finite document limit and the pro plans unlimited", () => {
		expect(planCatalog.free.documentLimit).toBe(3);
		expect(planCatalog["pro-monthly"].documentLimit).toBeNull();
		expect(planCatalog["pro-yearly"].documentLimit).toBeNull();
	});

	it("gives the pro plans access to every template", () => {
		const allTemplateCount = templateSchema.options.length;
		expect(planCatalog["pro-monthly"].allowedTemplates).toHaveLength(allTemplateCount);
		expect(planCatalog["pro-yearly"].allowedTemplates).toHaveLength(allTemplateCount);
	});

	it("charges 0 for the free plan and a positive amount for paid plans", () => {
		expect(planCatalog.free.priceXof).toBe(0);
		expect(planCatalog["pro-monthly"].priceXof).toBeGreaterThan(0);
		expect(planCatalog["pro-yearly"].priceXof).toBeGreaterThan(0);
	});
});

describe("getPlan", () => {
	it("returns the plan matching the given id", () => {
		expect(getPlan("free").name).toBe("Gratuit");
	});
});

describe("isTemplateAllowedForPlan", () => {
	it("allows a free-tier template on the free plan", () => {
		expect(isTemplateAllowedForPlan("free", "onyx")).toBe(true);
	});

	it("rejects a pro-only template on the free plan", () => {
		expect(isTemplateAllowedForPlan("free", "espeon")).toBe(false);
	});

	it("allows any template on a pro plan", () => {
		expect(isTemplateAllowedForPlan("pro-monthly", "espeon")).toBe(true);
	});
});
