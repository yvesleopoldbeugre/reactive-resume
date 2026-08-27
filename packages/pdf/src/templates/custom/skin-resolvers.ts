import type { Skin } from "@reactive-resume/schema/resume/skin";
import type { TemplateColorRoles, TemplateFeatures } from "../shared/types";
import { rgbaStringToHex } from "@reactive-resume/utils/color";
import { getPrimaryTint } from "../shared/color-helpers";

/** Mirrors `colorDesignSchema` from `@reactive-resume/schema/resume/data` (no canonical type export exists for it). */
type ColorDesign = { primary: string; text: string; background: string };

/**
 * Derives the generic `custom` template's color roles from the resume's 3 base colors plus
 * the admin-chosen sidebar treatment. Pulled out of `useCustomTemplate` so the sidebar fill/
 * inversion logic is unit-testable without rendering.
 */
export function resolveCustomSkinColors(colors: ColorDesign, skin: Skin): TemplateColorRoles {
	const foreground = rgbaStringToHex(colors.text);
	const background = rgbaStringToHex(colors.background);
	const primary = rgbaStringToHex(colors.primary);

	const sidebarBackground =
		skin.sidebar.fill === "solid"
			? primary
			: skin.sidebar.fill === "tint"
				? getPrimaryTint(colors.primary, skin.sidebar.tintOpacity)
				: undefined;
	const sidebarForeground = skin.sidebar.foreground === "inverted" ? background : foreground;

	return { foreground, background, primary, sidebarForeground, sidebarBackground };
}

/** Maps the `skin.divider`/`skin.skeleton` choices onto the existing, shared `TemplateFeatures` flags. */
export function resolveCustomSkinFeatures(skin: Skin): TemplateFeatures {
	return {
		sectionTimeline: skin.divider === "timeline",
		mainItemHeaderBorder: skin.divider === "left-border",
		stackSidebarItemHeader: skin.skeleton === "columns",
	};
}
