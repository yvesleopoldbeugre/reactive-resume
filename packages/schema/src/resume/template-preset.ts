import z from "zod";
import { colorDesignSchema, layoutSchema, styleRulesSchema, typographySchema } from "./data";
import { skinSchema } from "./skin";

/**
 * The subset of resume metadata an admin-authored template preset can configure. Mirrors
 * `@reactive-resume/resume`'s `PresetConfig` type; kept here so the API boundary can validate
 * it with the same schemas the resume data itself uses (colors, typography, style rules, layout,
 * and — for a 'custom' base template — the structural skin).
 */
export const presetConfigSchema = z.strictObject({
	colors: colorDesignSchema.optional(),
	typography: typographySchema.optional(),
	styleRules: styleRulesSchema.optional(),
	layout: layoutSchema.optional(),
	skin: skinSchema.optional(),
});

export type PresetConfig = z.infer<typeof presetConfigSchema>;
