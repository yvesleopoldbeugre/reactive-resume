import type { colorDesignSchema, Layout, ResumeData, StyleRule, Typography } from "@reactive-resume/schema/resume/data";
import type { Skin } from "@reactive-resume/schema/resume/skin";
import type { z } from "zod";

export type PresetColors = z.infer<typeof colorDesignSchema>;

/**
 * The subset of `ResumeData["metadata"]` an admin-authored template preset can override.
 * Each field fully replaces the corresponding default when present; there is no deep/partial
 * merge, so a preset never leaves a resume in a half-configured state (e.g. only `heading` font
 * set on `typography` while `body` is missing). `skin` only applies when the preset's base
 * template is `"custom"`; it is ignored otherwise since built-in templates hardcode their own layout.
 */
export type PresetConfig = {
	colors?: PresetColors | undefined;
	typography?: Typography | undefined;
	styleRules?: StyleRule[] | undefined;
	layout?: Layout | undefined;
	skin?: Skin | undefined;
};

/** Overlays a template preset's configuration onto resume data, replacing whole fields, never merging partially. */
export function applyPresetConfig(data: ResumeData, config: PresetConfig): ResumeData {
	return {
		...data,
		metadata: {
			...data.metadata,
			design: config.colors ? { ...data.metadata.design, colors: config.colors } : data.metadata.design,
			typography: config.typography ?? data.metadata.typography,
			styleRules: config.styleRules ?? data.metadata.styleRules,
			layout: config.layout ?? data.metadata.layout,
			skin: config.skin ?? data.metadata.skin,
		},
	};
}
