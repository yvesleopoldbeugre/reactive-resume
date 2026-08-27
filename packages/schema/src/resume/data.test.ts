import { describe, expect, it } from "vitest";
import {
	baseSectionSchema,
	basicsSchema,
	customFieldSchema,
	experienceItemSchema,
	layoutSchema,
	normalizeCoverLetterSection,
	pageSchema,
	pictureSchema,
	resumeDataSchema,
	skillItemSchema,
	styleRuleSchema,
	styleRulesSchema,
	summarySchema,
	websiteSchema,
} from "./data";
import { defaultResumeData } from "./default";

describe("resumeDataSchema", () => {
	it("validates the default resume", () => {
		expect(resumeDataSchema.safeParse(defaultResumeData).success).toBe(true);
	});

	it("rejects empty object", () => {
		expect(resumeDataSchema.safeParse({}).success).toBe(false);
	});

	it("rejects missing top-level keys", () => {
		const partial = { ...defaultResumeData, basics: undefined };
		expect(resumeDataSchema.safeParse(partial).success).toBe(false);
	});
});

describe("websiteSchema", () => {
	it("requires url and label fields", () => {
		expect(websiteSchema.safeParse({ url: "https://example.com", label: "Example" }).success).toBe(true);
	});

	it("rejects missing url", () => {
		expect(websiteSchema.safeParse({ label: "Example" }).success).toBe(false);
	});

	it("rejects missing label", () => {
		expect(websiteSchema.safeParse({ url: "https://example.com" }).success).toBe(false);
	});

	it("allows empty strings (caller decides display)", () => {
		expect(websiteSchema.safeParse({ url: "", label: "" }).success).toBe(true);
	});
});

describe("pictureSchema", () => {
	it("accepts the default picture config", () => {
		expect(pictureSchema.safeParse(defaultResumeData.picture).success).toBe(true);
	});

	it("rejects size below 32", () => {
		const invalid = { ...defaultResumeData.picture, size: 16 };
		expect(pictureSchema.safeParse(invalid).success).toBe(false);
	});

	it("rejects size above 512", () => {
		const invalid = { ...defaultResumeData.picture, size: 1024 };
		expect(pictureSchema.safeParse(invalid).success).toBe(false);
	});

	it("rejects rotation below 0", () => {
		const invalid = { ...defaultResumeData.picture, rotation: -1 };
		expect(pictureSchema.safeParse(invalid).success).toBe(false);
	});

	it("rejects rotation above 360", () => {
		const invalid = { ...defaultResumeData.picture, rotation: 361 };
		expect(pictureSchema.safeParse(invalid).success).toBe(false);
	});
});

describe("basicsSchema", () => {
	it("validates default basics", () => {
		expect(basicsSchema.safeParse(defaultResumeData.basics).success).toBe(true);
	});

	it("requires email to be a string but does not enforce email shape (catches at app level)", () => {
		const result = basicsSchema.safeParse({
			...defaultResumeData.basics,
			email: "not-an-email",
		});
		expect(result.success).toBe(true);
	});

	it("supports customFields array", () => {
		const result = basicsSchema.safeParse({
			...defaultResumeData.basics,
			customFields: [{ id: "1", icon: "phone", text: "555-0000", link: "" }],
		});
		expect(result.success).toBe(true);
	});
});

describe("customFieldSchema", () => {
	it("requires id, icon, and text", () => {
		const result = customFieldSchema.safeParse({
			id: "1",
			icon: "phone",
			text: "555-0000",
			link: "",
		});
		expect(result.success).toBe(true);
	});

	it("rejects missing id", () => {
		expect(customFieldSchema.safeParse({ icon: "phone", text: "555-0000", link: "" }).success).toBe(false);
	});

	it("falls back to empty link via .catch when missing", () => {
		const result = customFieldSchema.safeParse({ id: "1", icon: "phone", text: "x" });
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.link).toBe("");
	});
});

describe("experienceItemSchema", () => {
	it("requires company name (min 1)", () => {
		const result = experienceItemSchema.safeParse({
			id: "abcdef0123456789",
			hidden: false,
			company: "",
			position: "Engineer",
			location: "",
			period: "",
			website: { url: "", label: "", inlineLink: false },
			description: "",
			roles: [],
		});
		expect(result.success).toBe(false);
	});

	it("validates a complete experience item", () => {
		const result = experienceItemSchema.safeParse({
			id: "abcdef0123456789",
			hidden: false,
			company: "Acme",
			position: "Engineer",
			location: "NYC",
			period: "2020 - 2023",
			website: { url: "https://acme.com", label: "Acme", inlineLink: false },
			description: "<p>Did things</p>",
			roles: [],
		});
		expect(result.success).toBe(true);
	});

	it("defaults roles to [] via .catch when missing", () => {
		const result = experienceItemSchema.safeParse({
			id: "x",
			hidden: false,
			company: "Acme",
			position: "",
			location: "",
			period: "",
			website: { url: "", label: "", inlineLink: false },
			description: "",
		});
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.roles).toEqual([]);
	});
});

describe("skillItemSchema", () => {
	it("requires name (min 1)", () => {
		const invalid = {
			id: "x",
			hidden: false,
			icon: "",
			iconColor: "",
			name: "",
			proficiency: "",
			level: 4,
			keywords: [],
		};
		expect(skillItemSchema.safeParse(invalid).success).toBe(false);
	});

	it("clamps invalid level via .catch(0)", () => {
		const item = {
			id: "x",
			hidden: false,
			icon: "",
			iconColor: "",
			name: "TS",
			proficiency: "",
			level: 99,
			keywords: [],
		};
		const result = skillItemSchema.safeParse(item);
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.level).toBe(0);
	});

	it("allows level between 0 and 5", () => {
		for (const level of [0, 1, 2, 3, 4, 5]) {
			const item = {
				id: "x",
				hidden: false,
				icon: "",
				iconColor: "",
				name: "X",
				proficiency: "",
				level,
				keywords: [],
			};
			expect(skillItemSchema.safeParse(item).success).toBe(true);
		}
	});

	it("falls back to empty array when keywords is invalid via .catch", () => {
		const item = {
			id: "x",
			hidden: false,
			icon: "",
			iconColor: "",
			name: "X",
			proficiency: "",
			level: 3,
			keywords: "not-an-array",
		};
		const result = skillItemSchema.safeParse(item);
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.keywords).toEqual([]);
	});
});

describe("layoutSchema", () => {
	it("validates default layout", () => {
		expect(layoutSchema.safeParse(defaultResumeData.metadata.layout).success).toBe(true);
	});

	it("clamps sidebarWidth out-of-range to 35", () => {
		const result = layoutSchema.safeParse({
			...defaultResumeData.metadata.layout,
			sidebarWidth: 999,
		});
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.sidebarWidth).toBe(35);
	});

	it("clamps sidebarWidth below 10 to 35", () => {
		const result = layoutSchema.safeParse({
			...defaultResumeData.metadata.layout,
			sidebarWidth: 5,
		});
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.sidebarWidth).toBe(35);
	});
});

describe("pageSchema", () => {
	it("rejects negative gap or margin values", () => {
		const invalid = { ...defaultResumeData.metadata.page, gapX: -1 };
		expect(pageSchema.safeParse(invalid).success).toBe(false);
	});

	it("falls back to 'a4' for unknown format via .catch", () => {
		const invalid = { ...defaultResumeData.metadata.page, format: "huge" };
		const result = pageSchema.safeParse(invalid);
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.format).toBe("a4");
	});

	it("accepts each known format", () => {
		for (const format of ["a4", "letter", "free-form"] as const) {
			const valid = { ...defaultResumeData.metadata.page, format };
			expect(pageSchema.safeParse(valid).success).toBe(true);
		}
	});

	it("defaults hideSectionIcons to true when missing", () => {
		const { hideSectionIcons: _, ...pageWithout } = defaultResumeData.metadata.page;
		const result = pageSchema.safeParse(pageWithout);
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.hideSectionIcons).toBe(true);
	});

	it("defaults hideLinkUnderline to false when missing", () => {
		const { hideLinkUnderline: _, ...pageWithout } = defaultResumeData.metadata.page;
		const result = pageSchema.safeParse(pageWithout);
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.hideLinkUnderline).toBe(false);
	});
});

describe("baseSectionSchema", () => {
	it("defaults icon to empty string when missing", () => {
		const result = baseSectionSchema.safeParse({ title: "Test", columns: 1, hidden: false });
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.icon).toBe("");
	});

	it("accepts a custom icon value", () => {
		const result = baseSectionSchema.safeParse({ title: "Test", icon: "rocket", columns: 1, hidden: false });
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.icon).toBe("rocket");
	});

	it("accepts 'none' as a valid icon value", () => {
		const result = baseSectionSchema.safeParse({ title: "Test", icon: "none", columns: 1, hidden: false });
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.icon).toBe("none");
	});
});

describe("normalizeCoverLetterSection", () => {
	const baseSection = {
		title: "Cover Letter",
		icon: "",
		columns: 1,
		hidden: false,
		keepTogether: false,
		startOnNewPage: false,
		id: "section-1",
		type: "cover-letter" as const,
	};

	it("expands a legacy {recipient, content} item into recipient + paragraph parts", () => {
		const normalized = normalizeCoverLetterSection({
			...baseSection,
			items: [{ id: "item-1", hidden: false, recipient: "<p>Jane Doe</p>", content: "<p>Dear Jane,</p>" }],
		}) as { items: unknown[] };

		expect(normalized.items).toHaveLength(2);
		expect(normalized.items[0]).toMatchObject({ id: "item-1", partType: "recipient", content: "<p>Jane Doe</p>" });
		expect(normalized.items[1]).toMatchObject({
			id: "item-1-body",
			partType: "paragraph",
			content: "<p>Dear Jane,</p>",
		});
	});

	it("drops an empty recipient/content half instead of emitting an empty part", () => {
		const normalized = normalizeCoverLetterSection({
			...baseSection,
			items: [{ id: "item-1", hidden: false, recipient: "", content: "<p>Dear Jane,</p>" }],
		}) as { items: unknown[] };

		expect(normalized.items).toHaveLength(1);
		expect(normalized.items[0]).toMatchObject({ partType: "paragraph", content: "<p>Dear Jane,</p>" });
	});

	it("passes through already-migrated items unchanged (idempotent)", () => {
		const normalized = normalizeCoverLetterSection({
			...baseSection,
			items: [{ id: "item-1", hidden: false, partType: "salutation", content: "<p>Dear Jane,</p>" }],
		}) as { items: unknown[] };

		expect(normalized.items).toHaveLength(1);
		expect(normalized.items[0]).toMatchObject({ id: "item-1", partType: "salutation", content: "<p>Dear Jane,</p>" });
	});

	it("preserves per-item hidden state through the expansion", () => {
		const normalized = normalizeCoverLetterSection({
			...baseSection,
			items: [{ id: "item-1", hidden: true, recipient: "<p>Jane Doe</p>", content: "<p>Dear Jane,</p>" }],
		}) as { items: { hidden: boolean }[] };

		expect(normalized.items.every((item) => item.hidden)).toBe(true);
	});

	it("does not affect non-cover-letter section types", () => {
		const normalized = normalizeCoverLetterSection({
			...baseSection,
			type: "summary",
			items: [{ id: "item-1", hidden: false, content: "<p>Just a summary item</p>" }],
		}) as { items: unknown[] };

		expect(normalized.items).toHaveLength(1);
	});
});

describe("resumeDataSchema (cover-letter legacy normalization, end-to-end)", () => {
	it("normalizes a legacy-shaped cover-letter custom section when parsing a full resume", () => {
		const withLegacyCoverLetter = {
			...defaultResumeData,
			customSections: [
				{
					title: "Cover Letter",
					icon: "",
					columns: 1,
					hidden: false,
					keepTogether: false,
					startOnNewPage: false,
					id: "section-1",
					type: "cover-letter" as const,
					items: [{ id: "item-1", hidden: false, recipient: "<p>Jane Doe</p>", content: "<p>Dear Jane,</p>" }],
				},
			],
		};

		const result = resumeDataSchema.safeParse(withLegacyCoverLetter);
		expect(result.success).toBe(true);
		if (!result.success) return;
		expect(result.data.customSections[0]?.items).toHaveLength(2);
	});
});

describe("summarySchema", () => {
	it("defaults icon to empty string when missing", () => {
		const result = summarySchema.safeParse({ title: "", columns: 1, hidden: false, content: "" });
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.icon).toBe("");
	});
});

describe("styleRulesSchema", () => {
	const educationHeadingRule = {
		id: "education-heading",
		label: "Education heading",
		enabled: true,
		target: { scope: "sectionType", sectionType: "education" },
		slots: { heading: { fontSize: 20 } },
	};

	it("defaults to an empty rule list on default resume metadata", () => {
		expect(defaultResumeData.metadata.styleRules).toEqual([]);
		expect(styleRulesSchema.safeParse(defaultResumeData.metadata.styleRules).success).toBe(true);
	});

	it("preserves valid rules when another rule has an invalid style intent", () => {
		expect(
			styleRulesSchema.parse([
				educationHeadingRule,
				{
					id: "experience-heading",
					label: "Experience heading",
					enabled: true,
					target: { scope: "sectionType", sectionType: "experience" },
					slots: { heading: { fontSize: -1 } },
				},
			]),
		).toEqual([educationHeadingRule]);
	});

	it("drops invalid style fields without dropping the whole rule", () => {
		expect(
			styleRulesSchema.parse([
				{
					id: "partial-heading",
					label: "Partial heading",
					enabled: true,
					target: { scope: "global" },
					slots: { heading: { color: "rgba(0, 0, 0, 1)", fontSize: -1 } },
				},
			]),
		).toEqual([
			{
				id: "partial-heading",
				label: "Partial heading",
				enabled: true,
				target: { scope: "global" },
				slots: { heading: { color: "rgba(0, 0, 0, 1)" } },
			},
		]);
	});

	it("falls back to an empty rule list for non-array persisted values", () => {
		expect(styleRulesSchema.parse({})).toEqual([]);
	});

	it("drops rules with unknown slot keys", () => {
		expect(
			styleRulesSchema.parse([
				{
					id: "unknown-slot",
					label: "Unknown slot",
					enabled: true,
					target: { scope: "global" },
					slots: { richListItemMarker: { color: "rgba(0, 0, 0, 1)" } },
				},
				educationHeadingRule,
			]),
		).toEqual([educationHeadingRule]);
	});

	it("accepts global, section-type, and section-id targets", () => {
		const rules = [
			{
				id: "global-headings",
				label: "Global headings",
				enabled: true,
				target: { scope: "global" },
				slots: {
					heading: {
						color: "rgba(220, 38, 38, 1)",
						fontWeight: "700",
						fontStyle: "italic",
						lineHeight: 1.35,
						letterSpacing: -0.5,
						textDecoration: "underline",
						textDecorationColor: "rgba(220, 38, 38, 1)",
						textDecorationStyle: "dotted",
						textAlign: "center",
						textTransform: "uppercase",
						opacity: 0.85,
					},
				},
			},
			{
				id: "experience-items",
				label: "Experience items",
				enabled: true,
				target: { scope: "sectionType", sectionType: "experience" },
				slots: {
					item: {
						backgroundColor: "rgba(245, 245, 245, 1)",
						padding: -6,
						marginBottom: -4,
						rowGap: -2,
						borderStyle: "dashed",
					},
				},
			},
			{
				id: "custom-section",
				label: "Custom section",
				enabled: true,
				target: { scope: "sectionId", sectionId: "94ddf90f-46ef-4b0a-9a99-2ed118af52dd" },
				slots: { richList: { rowGap: 6 } },
			},
		];

		expect(styleRulesSchema.safeParse(rules).success).toBe(true);
	});

	it("rejects section-item targets for v1", () => {
		expect(
			styleRuleSchema.safeParse({
				id: "item-style",
				label: "Item Style",
				enabled: true,
				target: { scope: "sectionItem", sectionId: "experience", itemId: "item-1" },
				slots: { item: { color: "rgba(0, 0, 0, 1)" } },
			}).success,
		).toBe(false);
	});

	it("rejects unsupported raw layout properties", () => {
		expect(
			styleRuleSchema.safeParse({
				id: "unsafe",
				label: "Unsafe",
				enabled: true,
				target: { scope: "global" },
				slots: { section: { position: "absolute" } },
			}).success,
		).toBe(false);
	});

	it("rejects the removed rich-text marker slot", () => {
		expect(
			styleRuleSchema.safeParse({
				id: "marker",
				label: "Marker",
				enabled: true,
				target: { scope: "global" },
				slots: { richListItemMarker: { color: "rgba(21, 93, 252, 1)" } },
			}).success,
		).toBe(false);
	});

	it("rejects unsafe visible style values outside the v1 ranges", () => {
		expect(
			styleRuleSchema.safeParse({
				id: "unsafe-visible",
				label: "Unsafe Visible",
				enabled: true,
				target: { scope: "global" },
				slots: { heading: { opacity: 2, lineHeight: 10, letterSpacing: -17 } },
			}).success,
		).toBe(false);
	});
});
