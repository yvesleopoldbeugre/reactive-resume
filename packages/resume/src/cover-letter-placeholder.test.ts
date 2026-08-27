import { describe, expect, it } from "vitest";
import { defaultResumeData } from "@reactive-resume/schema/resume/default";
import {
	buildPlaceholderCoverLetterData,
	getCoverLetterPlaceholderParts,
	withPlaceholderCoverLetter,
} from "./cover-letter-placeholder";

const makeId = (() => {
	let n = 0;
	return () => `id-${++n}`;
})();

describe("getCoverLetterPlaceholderParts", () => {
	it("returns the English parts by default", () => {
		const parts = getCoverLetterPlaceholderParts();
		expect(parts.map((part) => part.partType)).toEqual([
			"recipient",
			"subject",
			"salutation",
			"paragraph",
			"paragraph",
			"paragraph",
			"closing",
			"signature",
		]);
		expect(parts.find((part) => part.partType === "salutation")?.content).toContain("Dear");
	});

	it("returns the English parts for a non-French locale", () => {
		expect(getCoverLetterPlaceholderParts("en-US").find((part) => part.partType === "subject")?.content).toContain(
			"[job title]",
		);
	});

	it("returns the French parts for fr-FR", () => {
		const parts = getCoverLetterPlaceholderParts("fr-FR");
		expect(parts.find((part) => part.partType === "salutation")?.content).toContain("Madame, Monsieur,");
		expect(parts.find((part) => part.partType === "subject")?.content).toContain("[intitulé du poste]");
	});
});

describe("withPlaceholderCoverLetter", () => {
	it("adds exactly one cover-letter section with one item per placeholder part", () => {
		const result = withPlaceholderCoverLetter(defaultResumeData, undefined, makeId);
		const sections = result.customSections.filter((section) => section.type === "cover-letter");
		expect(sections).toHaveLength(1);
		expect(sections[0]?.items).toHaveLength(8);
		expect((sections[0]?.items[0] as { partType: string } | undefined)?.partType).toBe("recipient");
	});

	it("replaces an existing cover-letter section instead of adding a second one", () => {
		const withFirst = withPlaceholderCoverLetter(defaultResumeData, undefined, makeId);
		const withSecond = withPlaceholderCoverLetter(withFirst, "fr-FR", makeId);

		const sections = withSecond.customSections.filter((section) => section.type === "cover-letter");
		expect(sections).toHaveLength(1);
		const salutation = sections[0]?.items.find((item) => "partType" in item && item.partType === "salutation");
		expect((salutation as { content: string } | undefined)?.content).toContain("Madame, Monsieur,");
	});

	it("does not mutate the input data", () => {
		const originalLength = defaultResumeData.customSections.length;
		withPlaceholderCoverLetter(defaultResumeData, undefined, makeId);
		expect(defaultResumeData.customSections).toHaveLength(originalLength);
	});
});

describe("buildPlaceholderCoverLetterData", () => {
	it("collapses the layout to a single full-width page containing only the letter section", () => {
		const result = buildPlaceholderCoverLetterData(defaultResumeData, undefined, makeId);
		const [section] = result.customSections;

		expect(result.metadata.layout.pages).toHaveLength(1);
		expect(result.metadata.layout.pages[0]).toEqual({ fullWidth: true, main: [section?.id], sidebar: [] });
	});
});
