import { describe, expect, it } from "vitest";
import { defaultResumeData } from "@reactive-resume/schema/resume/default";
import { defaultSkin } from "@reactive-resume/schema/resume/skin";
import { applyPresetConfig } from "./preset";

describe("applyPresetConfig", () => {
	it("returns the metadata unchanged when the config is empty", () => {
		const result = applyPresetConfig(defaultResumeData, {});

		expect(result.metadata).toEqual(defaultResumeData.metadata);
	});

	it("replaces only the colors, keeping the rest of design untouched", () => {
		const colors = { primary: "rgba(10, 20, 30, 1)", text: "rgba(0, 0, 0, 1)", background: "rgba(255, 255, 255, 1)" };

		const result = applyPresetConfig(defaultResumeData, { colors });

		expect(result.metadata.design.colors).toEqual(colors);
		expect(result.metadata.design.level).toEqual(defaultResumeData.metadata.design.level);
		expect(result.metadata.typography).toEqual(defaultResumeData.metadata.typography);
	});

	it("replaces typography wholesale", () => {
		const typography = {
			...defaultResumeData.metadata.typography,
			heading: { ...defaultResumeData.metadata.typography.heading, fontFamily: "Merriweather" },
		};

		const result = applyPresetConfig(defaultResumeData, { typography });

		expect(result.metadata.typography).toEqual(typography);
	});

	it("replaces styleRules wholesale", () => {
		const styleRules = [
			{
				id: "rule-1",
				label: "Accent headings",
				enabled: true,
				target: { scope: "global" as const },
				slots: { heading: { color: "rgba(200, 0, 0, 1)" } },
			},
		];

		const result = applyPresetConfig(defaultResumeData, { styleRules });

		expect(result.metadata.styleRules).toEqual(styleRules);
	});

	it("replaces layout wholesale", () => {
		const layout = {
			sidebarWidth: 40,
			pages: [{ fullWidth: false, main: ["summary"], sidebar: ["skills"] }],
		};

		const result = applyPresetConfig(defaultResumeData, { layout });

		expect(result.metadata.layout).toEqual(layout);
	});

	it("replaces skin wholesale, leaving the rest untouched", () => {
		const skin: typeof defaultSkin = {
			...defaultSkin,
			skeleton: "stacked",
			heading: { decoration: "uppercase" },
		};

		const result = applyPresetConfig(defaultResumeData, { skin });

		expect(result.metadata.skin).toEqual(skin);
		expect(result.metadata.typography).toEqual(defaultResumeData.metadata.typography);
	});

	it("leaves skin undefined when the config does not set it", () => {
		const result = applyPresetConfig(defaultResumeData, { colors: defaultResumeData.metadata.design.colors });

		expect(result.metadata.skin).toBeUndefined();
	});

	it("applies every field at once without cross-contamination", () => {
		const colors = { primary: "rgba(1, 2, 3, 1)", text: "rgba(0, 0, 0, 1)", background: "rgba(255, 255, 255, 1)" };
		const typography = defaultResumeData.metadata.typography;
		const styleRules: never[] = [];
		const layout = { sidebarWidth: 30, pages: [{ fullWidth: true, main: [], sidebar: [] }] };

		const result = applyPresetConfig(defaultResumeData, { colors, typography, styleRules, layout });

		expect(result.metadata.design.colors).toEqual(colors);
		expect(result.metadata.typography).toEqual(typography);
		expect(result.metadata.styleRules).toEqual(styleRules);
		expect(result.metadata.layout).toEqual(layout);
	});

	it("does not mutate the original resume data", () => {
		const original = structuredClone(defaultResumeData);

		applyPresetConfig(defaultResumeData, {
			colors: { primary: "rgba(9, 9, 9, 1)", text: "rgba(0, 0, 0, 1)", background: "rgba(255, 255, 255, 1)" },
		});

		expect(defaultResumeData).toEqual(original);
	});
});
