// @vitest-environment happy-dom

import type { CustomSection, ResumeData, SectionType } from "@reactive-resume/schema/resume/data";
import { describe, expect, it } from "vitest";
import { getDefaultSectionIconName } from "@reactive-resume/schema/resume/section-icons";
import { renderBuiltInSection, renderCustomSection, renderSummary, setRenderConfig } from "./section-renderers";

const baseConfig = {
	headingFont: "Inter",
	headingSizeHalfPt: 28,
	bodyFont: "Inter",
	bodySizeHalfPt: 20,
	textColorHex: "111111",
	primaryColorHex: "0563C1",
};

setRenderConfig(baseConfig);

const HEX = "#0563C1";

describe("renderSummary", () => {
	it("returns [] when the section is hidden", () => {
		const summary: ResumeData["summary"] = {
			title: "Summary",
			icon: getDefaultSectionIconName("summary"),
			content: "<p>Hello</p>",
			hidden: true,
			columns: 1,
			keepTogether: false,
			startOnNewPage: false,
		};
		expect(renderSummary(summary, HEX)).toEqual([]);
	});

	it("returns [] when content is empty", () => {
		const summary: ResumeData["summary"] = {
			title: "Summary",
			icon: getDefaultSectionIconName("summary"),
			content: "",
			hidden: false,
			columns: 1,
			keepTogether: false,
			startOnNewPage: false,
		};
		expect(renderSummary(summary, HEX)).toEqual([]);
	});

	it("includes a heading paragraph when both title and content are present", () => {
		const summary: ResumeData["summary"] = {
			title: "Summary",
			icon: getDefaultSectionIconName("summary"),
			content: "<p>Hello world</p>",
			hidden: false,
			columns: 1,
			keepTogether: false,
			startOnNewPage: false,
		};
		const paragraphs = renderSummary(summary, HEX);
		// One heading + the htmlToParagraphs output for one <p>.
		expect(paragraphs.length).toBeGreaterThanOrEqual(2);
	});

	it("omits the heading when title is empty but still renders content", () => {
		const summary: ResumeData["summary"] = {
			title: "",
			icon: getDefaultSectionIconName("summary"),
			content: "<p>Hello world</p>",
			hidden: false,
			columns: 1,
			keepTogether: false,
			startOnNewPage: false,
		};
		const paragraphs = renderSummary(summary, HEX);
		expect(paragraphs.length).toBeGreaterThanOrEqual(1);
	});
});

const emptySection = <T extends SectionType>(type: T): ResumeData["sections"][T] =>
	({
		title: "Section",
		icon: getDefaultSectionIconName(type),
		columns: 1,
		hidden: false,
		keepTogether: false,
		startOnNewPage: false,
		items: [],
	}) as ResumeData["sections"][T];

describe("renderBuiltInSection", () => {
	it("returns [] when the section has no items", () => {
		expect(renderBuiltInSection("experience", emptySection("experience"), HEX)).toEqual([]);
	});

	it("returns [] when section.hidden is true", () => {
		const section = { ...emptySection("experience"), hidden: true };
		expect(renderBuiltInSection("experience", section, HEX)).toEqual([]);
	});

	it("returns [] for an unknown section type", () => {
		expect(renderBuiltInSection("not-a-section" as never, emptySection("experience"), HEX)).toEqual([]);
	});
});

describe("renderCustomSection", () => {
	const baseCustom: CustomSection = {
		id: "custom-1",
		type: "summary",
		title: "Notes",
		icon: getDefaultSectionIconName("summary"),
		columns: 1,
		hidden: false,
		keepTogether: false,
		startOnNewPage: false,
		items: [],
	};

	it("returns [] when the custom section is hidden", () => {
		expect(renderCustomSection({ ...baseCustom, hidden: true }, HEX)).toEqual([]);
	});

	it("returns [] when all items are hidden or empty", () => {
		const section: CustomSection = {
			...baseCustom,
			items: [{ id: "x", hidden: true } as never],
		};
		expect(renderCustomSection(section, HEX)).toEqual([]);
	});

	it("returns [] for an unknown custom section type", () => {
		const section: CustomSection = {
			...baseCustom,
			type: "no-such-type" as never,
			items: [{ id: "x", hidden: false, content: "<p>x</p>" } as never],
		};
		expect(renderCustomSection(section, HEX)).toEqual([]);
	});

	it("renders content for a summary-type custom section", () => {
		const section: CustomSection = {
			...baseCustom,
			type: "summary",
			items: [{ id: "x", hidden: false, content: "<p>Hello</p>" } as never],
		};
		const paragraphs = renderCustomSection(section, HEX);
		// 1 heading + at least one paragraph for the HTML
		expect(paragraphs.length).toBeGreaterThanOrEqual(2);
	});

	it("renders each part's content for a cover-letter custom section, one item per part", () => {
		const section: CustomSection = {
			...baseCustom,
			type: "cover-letter",
			title: "Cover Letter",
			items: [
				{ id: "x", hidden: false, partType: "recipient", content: "<p>Dear Jane,</p>" } as never,
				{ id: "y", hidden: false, partType: "paragraph", content: "<p>Body</p>" } as never,
			],
		};
		const paragraphs = renderCustomSection(section, HEX);
		expect(paragraphs).toHaveLength(2);
	});

	it("renders the subject part in bold with the template's accent color, regardless of its source HTML", () => {
		const section: CustomSection = {
			...baseCustom,
			type: "cover-letter",
			title: "Cover Letter",
			items: [{ id: "x", hidden: false, partType: "subject", content: "<p>Application for Role X</p>" } as never],
		};
		const paragraphs = renderCustomSection(section, HEX);
		expect(paragraphs).toHaveLength(1);
		const serialized = JSON.stringify(paragraphs);
		expect(serialized).toContain("Application for Role X");
		expect(serialized).toContain('"rootKey":"w:b"');
		expect(serialized).toContain(HEX.replace("#", ""));
	});

	it("inserts extra spacing before the closing and signature parts", () => {
		const section: CustomSection = {
			...baseCustom,
			type: "cover-letter",
			title: "Cover Letter",
			items: [
				{ id: "a", hidden: false, partType: "paragraph", content: "<p>Body</p>" } as never,
				{ id: "b", hidden: false, partType: "closing", content: "<p>Best regards,</p>" } as never,
				{ id: "c", hidden: false, partType: "signature", content: "<p>Jane Doe</p>" } as never,
			],
		};
		const paragraphs = renderCustomSection(section, HEX);
		// 1 body paragraph + 1 spacer + 1 closing paragraph + 1 spacer + 1 signature paragraph
		expect(paragraphs).toHaveLength(5);
	});
});

describe("setRenderConfig", () => {
	it("can be called repeatedly with a different config (no throw)", () => {
		expect(() => setRenderConfig({ ...baseConfig, headingFont: "Roboto", primaryColorHex: "ff0000" })).not.toThrow();

		// Restore for any later tests in the file
		setRenderConfig(baseConfig);
	});
});
