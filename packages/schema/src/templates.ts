import z from "zod";

export const templateSchema = z.enum([
	"azurill",
	"bronzor",
	"chikorita",
	"custom",
	"ditgar",
	"ditto",
	"eevee",
	"espeon",
	"gengar",
	"glalie",
	"kakuna",
	"lapras",
	"leafish",
	"meowth",
	"onyx",
	"pikachu",
	"rhyhorn",
	"scizor",
	"snorlax",
	"togepi",
	"vulpix",
]);

export type Template = z.infer<typeof templateSchema>;

/**
 * Whether a template is one of the 16 general-purpose CV templates or one of the templates
 * built specifically for cover letters (single flowing document: a header block plus the
 * letter body, no sections/sidebar). Exclusive, not a checklist — a template is authored for
 * one document kind, never both, mirroring how a template preset's own `kind` works.
 */
export const templateKindMap: Record<Template, "resume" | "cover-letter"> = {
	azurill: "resume",
	bronzor: "resume",
	chikorita: "resume",
	custom: "resume",
	ditgar: "resume",
	ditto: "resume",
	gengar: "resume",
	glalie: "resume",
	kakuna: "resume",
	lapras: "resume",
	leafish: "resume",
	meowth: "resume",
	onyx: "resume",
	pikachu: "resume",
	rhyhorn: "resume",
	scizor: "resume",
	eevee: "cover-letter",
	vulpix: "cover-letter",
	togepi: "cover-letter",
	snorlax: "cover-letter",
	espeon: "cover-letter",
};

export function isDedicatedCoverLetterTemplate(template: Template): boolean {
	return templateKindMap[template] === "cover-letter";
}
