import { describe, expect, it } from "vitest";
import { defaultResumeData } from "@reactive-resume/schema/resume/default";
import { sampleResumeData, sampleResumeDataFr } from "@reactive-resume/schema/resume/sample";
import { buildInitialResumeData } from "./build-initial-data";

describe("buildInitialResumeData", () => {
	it("returns undefined when neither a template nor sample data is requested", () => {
		expect(buildInitialResumeData({ withSampleData: false })).toBeUndefined();
	});

	it("applies the chosen template on top of the default resume data", () => {
		const data = buildInitialResumeData({ withSampleData: false, template: "pikachu" });

		expect(data?.metadata.template).toBe("pikachu");
		expect(data?.basics).toEqual(defaultResumeData.basics);
	});

	it("applies the chosen template on top of sample data when withSampleData is set", () => {
		const data = buildInitialResumeData({
			withSampleData: true,
			template: "gengar",
			profile: { name: "Jane Doe", email: "jane@example.com" },
		});

		expect(data?.metadata.template).toBe("gengar");
		expect(data?.basics.name).toBe("Jane Doe");
		expect(data?.basics.email).toBe("jane@example.com");
	});

	it("seeds the account holder's name/email into the sample persona's contact fields", () => {
		const data = buildInitialResumeData({
			withSampleData: true,
			profile: { name: "Jane Doe", email: "jane@example.com" },
		});

		expect(data?.basics.name).toBe("Jane Doe");
		expect(data?.basics.email).toBe("jane@example.com");
		// Everything else stays the fictional sample content.
		expect(data?.basics.headline).toBe(sampleResumeData.basics.headline);
	});

	it("returns the unmodified sample persona when no profile override is given", () => {
		const data = buildInitialResumeData({ withSampleData: true });

		expect(data?.basics.name).toBe(sampleResumeData.basics.name);
	});

	it("uses the French sample persona's fictional content when locale is fr-FR", () => {
		const data = buildInitialResumeData({
			withSampleData: true,
			locale: "fr-FR",
			profile: { name: "Jane Doe", email: "jane@example.com" },
		});

		expect(data?.basics.headline).toBe(sampleResumeDataFr.basics.headline);
		expect(data?.basics.name).toBe("Jane Doe");
		expect(data?.basics.email).toBe("jane@example.com");
	});

	it("seeds the template and config overrides from a template preset", () => {
		const colors = { primary: "rgba(10, 20, 30, 1)", text: "rgba(0, 0, 0, 1)", background: "rgba(255, 255, 255, 1)" };

		const data = buildInitialResumeData({
			withSampleData: false,
			preset: { baseTemplate: "chikorita", config: { colors } },
		});

		expect(data?.metadata.template).toBe("chikorita");
		expect(data?.metadata.design.colors).toEqual(colors);
	});

	it("lets a preset's base template win over a separately provided template", () => {
		const data = buildInitialResumeData({
			withSampleData: false,
			template: "pikachu",
			preset: { baseTemplate: "chikorita", config: {} },
		});

		expect(data?.metadata.template).toBe("chikorita");
	});

	it("applies a preset on top of sample data, keeping the profile override", () => {
		const data = buildInitialResumeData({
			withSampleData: true,
			preset: { baseTemplate: "ditgar", config: { layout: defaultResumeData.metadata.layout } },
			profile: { name: "Jane Doe", email: "jane@example.com" },
		});

		expect(data?.metadata.template).toBe("ditgar");
		expect(data?.metadata.layout).toEqual(defaultResumeData.metadata.layout);
		expect(data?.basics.name).toBe("Jane Doe");
	});

	it("does not mutate the shared defaultResumeData constant", () => {
		const originalTemplate = defaultResumeData.metadata.template;

		buildInitialResumeData({ withSampleData: false, template: "pikachu" });

		expect(defaultResumeData.metadata.template).toBe(originalTemplate);
	});

	describe("kind: cover-letter", () => {
		it("seeds a placeholder cover-letter section collapsed into a single full-width page when there is no sample data", () => {
			const data = buildInitialResumeData({ withSampleData: false, kind: "cover-letter" });

			expect(data).toBeDefined();
			const coverLetterSections = data?.customSections.filter((section) => section.type === "cover-letter") ?? [];
			expect(coverLetterSections).toHaveLength(1);
			expect(data?.metadata.layout.pages).toHaveLength(1);
			expect(data?.metadata.layout.pages[0]).toEqual({
				fullWidth: true,
				main: [coverLetterSections[0]?.id],
				sidebar: [],
			});
		});

		it("seeds a fill-in-the-blank English letter as one item per structural part, not an empty field", () => {
			const data = buildInitialResumeData({ withSampleData: false, kind: "cover-letter" });

			const section = data?.customSections.find((s) => s.type === "cover-letter");
			const items = (section?.items ?? []) as { partType: string; content: string }[];
			expect(items.map((item) => item.partType)).toEqual([
				"recipient",
				"subject",
				"salutation",
				"paragraph",
				"paragraph",
				"paragraph",
				"closing",
				"signature",
			]);
			expect(items.find((item) => item.partType === "recipient")?.content).toContain("[Company name]");
			expect(items.find((item) => item.partType === "subject")?.content).toContain("[job title]");
			expect(items.find((item) => item.partType === "paragraph")?.content).toMatch(/<p>.*<\/p>/);
		});

		it("seeds the French fill-in-the-blank letter template when locale is fr-FR", () => {
			const data = buildInitialResumeData({ withSampleData: false, kind: "cover-letter", locale: "fr-FR" });

			const section = data?.customSections.find((s) => s.type === "cover-letter");
			const items = (section?.items ?? []) as { partType: string; content: string }[];
			expect(items.find((item) => item.partType === "recipient")?.content).toContain("[Nom de l'entreprise]");
			expect(items.find((item) => item.partType === "salutation")?.content).toContain("Madame, Monsieur,");
			expect(items.find((item) => item.partType === "subject")?.content).toContain("[intitulé du poste]");
		});

		it("still seeds the fill-in-the-blank template (not the fictional sample letter) even when withSampleData is set", () => {
			const data = buildInitialResumeData({
				withSampleData: true,
				kind: "cover-letter",
				profile: { name: "Jane Doe", email: "jane@example.com" },
			});

			const coverLetterSections = data?.customSections.filter((section) => section.type === "cover-letter") ?? [];
			expect(coverLetterSections).toHaveLength(1);
			expect(data?.customSections).toHaveLength(1);

			const items = (coverLetterSections[0]?.items ?? []) as { partType: string; content: string }[];
			expect(items.find((item) => item.partType === "subject")?.content).toContain("[job title]");
			expect(items.every((item) => !item.content.includes("Sunrise Games Studio"))).toBe(true);
		});

		it("strips non-cover-letter sections out of the layout even for a blank cover letter", () => {
			const data = buildInitialResumeData({ withSampleData: false, kind: "cover-letter" });

			const allSectionIds = data?.metadata.layout.pages.flatMap((page) => [...page.main, ...page.sidebar]) ?? [];
			expect(allSectionIds).toEqual(data?.customSections.map((section) => section.id));
		});

		it("still applies a chosen template on top of the cover-letter shaping", () => {
			const data = buildInitialResumeData({ withSampleData: false, kind: "cover-letter", template: "pikachu" });

			expect(data?.metadata.template).toBe("pikachu");
			expect(data?.customSections).toHaveLength(1);
		});

		it("still applies a preset on top of the cover-letter shaping", () => {
			const colors = { primary: "rgba(10, 20, 30, 1)", text: "rgba(0, 0, 0, 1)", background: "rgba(255, 255, 255, 1)" };

			const data = buildInitialResumeData({
				withSampleData: false,
				kind: "cover-letter",
				preset: { baseTemplate: "chikorita", config: { colors } },
			});

			expect(data?.metadata.template).toBe("chikorita");
			expect(data?.metadata.design.colors).toEqual(colors);
			expect(data?.customSections).toHaveLength(1);
		});

		it("uses the preset's own letter text instead of the generic placeholder when the preset has one", () => {
			const data = buildInitialResumeData({
				withSampleData: false,
				kind: "cover-letter",
				preset: {
					baseTemplate: "chikorita",
					config: { coverLetterParts: [{ partType: "salutation", content: "<p>Yo,</p>" }] },
				},
			});

			const section = data?.customSections.find((s) => s.type === "cover-letter");
			expect(section?.items).toHaveLength(1);
			expect((section?.items[0] as { content: string } | undefined)?.content).toBe("<p>Yo,</p>");
		});
	});
});
