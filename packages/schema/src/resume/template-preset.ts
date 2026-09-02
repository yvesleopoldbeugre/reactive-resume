import z from "zod";
import { colorDesignSchema, coverLetterPartTypeSchema, layoutSchema, styleRulesSchema, typographySchema } from "./data";
import { skinSchema } from "./skin";

export const presetCoverLetterPartSchema = z.object({
	partType: coverLetterPartTypeSchema,
	content: z.string(),
});

export type PresetCoverLetterPart = z.infer<typeof presetCoverLetterPartSchema>;

/**
 * The subset of resume metadata an admin-authored template preset can configure. Mirrors
 * `@reactive-resume/resume`'s `PresetConfig` type; kept here so the API boundary can validate
 * it with the same schemas the resume data itself uses (colors, typography, style rules, layout,
 * and — for a 'custom' base template — the structural skin).
 *
 * `coverLetterParts` only applies to cover-letter-kind presets: the letter text (recipient block,
 * subject, salutation, body paragraphs, closing, signature) a document created from this preset
 * starts with, in place of the generic fill-in-the-blank placeholder every other preset uses.
 */
export const presetConfigSchema = z.strictObject({
	colors: colorDesignSchema.optional(),
	typography: typographySchema.optional(),
	styleRules: styleRulesSchema.optional(),
	layout: layoutSchema.optional(),
	skin: skinSchema.optional(),
	coverLetterParts: z.array(presetCoverLetterPartSchema).optional(),
});

export type PresetConfig = z.infer<typeof presetConfigSchema>;
