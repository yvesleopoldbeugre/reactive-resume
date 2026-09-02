import type { PresetConfig } from "@reactive-resume/resume/preset";
import type { ResumeData } from "@reactive-resume/schema/resume/data";
import type { Template } from "@reactive-resume/schema/templates";
import type { Locale } from "@reactive-resume/utils/locale";
import { buildPlaceholderCoverLetterData } from "@reactive-resume/resume/cover-letter-placeholder";
import { applyPresetConfig } from "@reactive-resume/resume/preset";
import { defaultResumeData } from "@reactive-resume/schema/resume/default";
import { createSampleResumeData } from "@reactive-resume/schema/resume/sample";
import { generateId } from "@reactive-resume/utils/string";

/**
 * Builds the initial resume data for a `create` call from the chosen options.
 * Returns `undefined` when neither option was given, so callers can omit `data`
 * entirely and let `resumeService.create` fall back to its own default.
 *
 * `profile` is the account holder's own name/email (not the resume's title) — when
 * sample data is requested, it seeds the fictional content's contact fields so the
 * user sees their own name/email on the preview instead of the sample persona's.
 * `locale` picks which language the fictional placeholder prose (headline, experience,
 * etc.) is written in, so it matches the site language instead of always English.
 * `preset`, when given, seeds the resume from an admin-published template preset: its
 * base template plus its colors/typography/style rules/layout overrides.
 *
 * `kind: "cover-letter"` always returns shaped data (never `undefined`, regardless of
 * `withSampleData`/`template`): exactly one `cover-letter` custom section, always seeded with a
 * fill-in-the-blank letter template (bracketed placeholders like `[Company name]`) rather than
 * fictional sample prose — unlike a resume's structured fields, a fictional example letter reads as
 * "someone else's finished letter" instead of "a template for you to fill in". The same
 * `buildPlaceholderCoverLetterData` helper backs the web app's template/preset preview tiles, so what
 * a preview shows always matches what creating from it actually produces.
 */
export function buildInitialResumeData(input: {
	withSampleData: boolean;
	kind?: "resume" | "cover-letter";
	template?: Template | undefined;
	preset?: { baseTemplate: Template; config: PresetConfig } | undefined;
	profile?: { name?: string | undefined; email?: string | undefined };
	locale?: Locale;
}): ResumeData | undefined {
	const base = input.withSampleData ? createSampleResumeData(input.profile, input.locale) : undefined;
	const template = input.preset?.baseTemplate ?? input.template;

	if (input.kind === "cover-letter") {
		const source = base ?? defaultResumeData;
		const projected = buildPlaceholderCoverLetterData(
			source,
			input.locale,
			generateId,
			input.preset?.config.coverLetterParts,
		);
		const withTemplate: ResumeData = template
			? { ...projected, metadata: { ...projected.metadata, template } }
			: projected;

		return input.preset ? applyPresetConfig(withTemplate, input.preset.config) : withTemplate;
	}

	if (!template) return base;

	const source = base ?? defaultResumeData;
	const withTemplate: ResumeData = { ...source, metadata: { ...source.metadata, template } };

	return input.preset ? applyPresetConfig(withTemplate, input.preset.config) : withTemplate;
}
