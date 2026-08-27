import { describe, expect, it } from "vitest";
import { sampleResumeData } from "@reactive-resume/schema/resume/sample";
import { shouldShowResumeHeader } from "./cover-letter";

const createCoverLetterOnlyData = () => {
	const data = structuredClone(sampleResumeData);
	const coverLetter = data.customSections.find((section) => section.type === "cover-letter");

	if (!coverLetter) throw new Error("sample resume must include a cover letter");

	return {
		...data,
		customSections: [coverLetter],
		metadata: {
			...data.metadata,
			layout: {
				...data.metadata.layout,
				pages: [{ fullWidth: true, main: [coverLetter.id], sidebar: [] }],
			},
		},
	};
};

describe("shouldShowResumeHeader", () => {
	it("hides the header when every visible layout section is a cover letter", () => {
		expect(shouldShowResumeHeader(createCoverLetterOnlyData())).toBe(false);
	});

	it("keeps the header for normal resume documents", () => {
		expect(shouldShowResumeHeader(sampleResumeData)).toBe(true);
	});

	it("always shows the header for a dedicated cover-letter template", () => {
		const base = createCoverLetterOnlyData();
		const data = { ...base, metadata: { ...base.metadata, template: "eevee" as const } };

		expect(shouldShowResumeHeader(data)).toBe(true);
	});
});
