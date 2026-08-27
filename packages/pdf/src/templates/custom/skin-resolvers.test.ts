import { describe, expect, it } from "vitest";
import { defaultSkin } from "@reactive-resume/schema/resume/skin";
import { resolveCustomSkinColors, resolveCustomSkinFeatures } from "./skin-resolvers";

const colors = { primary: "rgba(220, 38, 38, 1)", text: "rgba(0, 0, 0, 1)", background: "rgba(255, 255, 255, 1)" };

describe("resolveCustomSkinColors", () => {
	it("leaves the sidebar unfilled and non-inverted by default", () => {
		const result = resolveCustomSkinColors(colors, defaultSkin);

		expect(result.sidebarBackground).toBeUndefined();
		expect(result.sidebarForeground).toBe(result.foreground);
	});

	it("fills the sidebar with the solid primary color", () => {
		const skin = { ...defaultSkin, sidebar: { ...defaultSkin.sidebar, fill: "solid" as const } };

		const result = resolveCustomSkinColors(colors, skin);

		expect(result.sidebarBackground).toBe(result.primary);
	});

	it("fills the sidebar with a tint of the primary color", () => {
		const skin = { ...defaultSkin, sidebar: { ...defaultSkin.sidebar, fill: "tint" as const, tintOpacity: 0.2 } };

		const result = resolveCustomSkinColors(colors, skin);

		expect(result.sidebarBackground).toContain("rgba(220, 38, 38,");
		expect(result.sidebarBackground).not.toBe(result.primary);
	});

	it("inverts sidebar text to the background color when foreground is 'inverted'", () => {
		const skin = { ...defaultSkin, sidebar: { ...defaultSkin.sidebar, foreground: "inverted" as const } };

		const result = resolveCustomSkinColors(colors, skin);

		expect(result.sidebarForeground).toBe(result.background);
	});
});

describe("resolveCustomSkinFeatures", () => {
	it("enables no feature flags for the default skin", () => {
		const result = resolveCustomSkinFeatures(defaultSkin);

		expect(result.sectionTimeline).toBe(false);
		expect(result.mainItemHeaderBorder).toBe(false);
	});

	it("maps divider:'timeline' to the sectionTimeline feature flag", () => {
		const result = resolveCustomSkinFeatures({ ...defaultSkin, divider: "timeline" });

		expect(result.sectionTimeline).toBe(true);
		expect(result.mainItemHeaderBorder).toBe(false);
	});

	it("maps divider:'left-border' to the mainItemHeaderBorder feature flag", () => {
		const result = resolveCustomSkinFeatures({ ...defaultSkin, divider: "left-border" });

		expect(result.mainItemHeaderBorder).toBe(true);
		expect(result.sectionTimeline).toBe(false);
	});

	it("stacks sidebar item headers only for the 'columns' skeleton", () => {
		expect(resolveCustomSkinFeatures({ ...defaultSkin, skeleton: "columns" }).stackSidebarItemHeader).toBe(true);
		expect(resolveCustomSkinFeatures({ ...defaultSkin, skeleton: "stacked" }).stackSidebarItemHeader).toBe(false);
	});
});
