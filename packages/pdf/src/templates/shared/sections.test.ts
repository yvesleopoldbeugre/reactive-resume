import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const source = readFileSync(fileURLToPath(new URL("./sections.tsx", import.meta.url)), "utf8");

describe("ExperienceSection", () => {
	it("does not hide the item position header when role progression is present", () => {
		expect(source).not.toContain("item.roles.length === 0 && (hasPosition || hasSplitRowText(headerPeriod))");
	});

	it("does not repeat the summary period after rendering it in a role-progression header", () => {
		expect(source).not.toContain("item.roles.length > 0 && <Text>{item.period}</Text>");
	});
});

describe("CoverLetterSection", () => {
	it("always renders as a single flowing column, ignoring section.columns", () => {
		const block = source.match(
			/const CoverLetterSection = \({ section }: CoverLetterSectionProps\) => {(?<body>[\s\S]*?)\n};/,
		);
		expect(block?.groups?.body).toContain("<SectionItems columns={1}>");
	});

	it("renders each part's content as its own item, not a fixed recipient/content pair", () => {
		const block = source.match(
			/const CoverLetterSection = \({ section }: CoverLetterSectionProps\) => {(?<body>[\s\S]*?)\n};/,
		);
		expect(block?.groups?.body).toContain("<RichText>{item.content}</RichText>");
		expect(block?.groups?.body).not.toContain("item.recipient");
	});

	it("always renders the subject part in bold with the template's accent color, regardless of its source HTML", () => {
		const block = source.match(
			/const CoverLetterSection = \({ section }: CoverLetterSectionProps\) => {(?<body>[\s\S]*?)\n};/,
		);
		expect(block?.groups?.body).toContain('item.partType === "subject"');
		expect(block?.groups?.body).toContain("<Bold style={{ color: data.metadata.design.colors.primary }}>");
		expect(block?.groups?.body).toContain("{stripHtml(item.content)}</Bold>");
	});

	it("gives the closing and signature parts extra space before them", () => {
		const block = source.match(
			/const CoverLetterSection = \({ section }: CoverLetterSectionProps\) => {(?<body>[\s\S]*?)\n};/,
		);
		expect(block?.groups?.body).toContain('item.partType === "closing" || item.partType === "signature"');
		expect(block?.groups?.body).toContain("metrics.gapY(1)");
	});
});

describe("SectionShell", () => {
	it("keeps section and heading style rules when section heading icons are hidden", () => {
		expect(source).toContain("<View style={composeStyles(sectionStyle, sectionRuleStyle)} {...breakProps}>");
		expect(source).toContain("<Heading style={composeStyles(sectionHeadingStyle, sectionHeadingRuleStyle)}>");
	});

	it("wires the section heading container style slot into the icon row", () => {
		expect(source).toContain('useTemplateStyle("sectionHeadingContainer")');
		expect(source).toContain("sectionHeadingContainerStyle");
	});

	it("top-aligns heading icon rows and does not use unsupported auto width resets", () => {
		const headingContainerBlock = source.match(
			/const defaultSectionHeadingContainerStyle = {(?<body>[\s\S]*?)} satisfies Style;/,
		);

		expect(headingContainerBlock?.groups?.body).toContain('alignItems: "flex-start"');
		expect(source).toContain("getSectionHeadingTextStyle(sectionHeadingStyle, sectionHeadingRuleStyle)");
		expect(source).toContain("width: _width");
		expect(source).not.toContain('width: "auto"');
	});
});
