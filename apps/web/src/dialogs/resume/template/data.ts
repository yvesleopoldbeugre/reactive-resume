import type { MessageDescriptor } from "@lingui/core";
import type { Template } from "@reactive-resume/schema/templates";
import { msg } from "@lingui/core/macro";
import { templateKindMap } from "@reactive-resume/schema/templates";

export type TemplateMetadata = {
	name: string;
	description: MessageDescriptor;
	imageUrl: string;
	tags: string[];
	sidebarPosition: "left" | "right" | "none";
};

export const templates = {
	// Always defined first so it sorts first in the admin base-template grid — the other
	// entries are iterated via `Object.entries` in this object's declaration order.
	custom: {
		name: "Créer un nouveau modèle",
		description: msg`A blank structural starting point: choose a skeleton, header, sidebar, and heading style from scratch instead of starting from a built-in template.`,
		imageUrl: "/templates/jpg/custom.jpg",
		tags: ["Sur mesure"],
		// The real position depends on the resume's `metadata.skin`, not this static catalog —
		// see `resolveSidebarPosition` in the layout panel for the dynamic override.
		sidebarPosition: "none",
	},
	azurill: {
		name: "Azurill",
		description: msg`Two-column with a bold colored sidebar and skill bars; great for creative or tech roles where visual flair is welcome.`,
		imageUrl: "/templates/jpg/azurill.jpg",
		tags: ["Two-column", "Creative", "Tech", "Visual flair"],
		sidebarPosition: "left",
	},
	bronzor: {
		name: "Bronzor",
		description: msg`Two-column, clean and professional with subtle section dividers; suits corporate, finance, or consulting positions.`,
		imageUrl: "/templates/jpg/bronzor.jpg",
		tags: ["Two-column", "Clean", "Professional", "Corporate", "Finance", "Consulting"],
		sidebarPosition: "none",
	},
	chikorita: {
		name: "Chikorita",
		description: msg`Two-column with a soft header accent and circular profile photo; ideal for marketing, HR, or client-facing roles.`,
		imageUrl: "/templates/jpg/chikorita.jpg",
		tags: ["Two-column", "Soft accent", "Marketing", "HR", "Client-facing"],
		sidebarPosition: "right",
	},
	ditgar: {
		name: "Ditgar",
		description: msg`Two-column with a dark teal sidebar and skills grid; modern feel for developers, data scientists, or technical PMs.`,
		imageUrl: "/templates/jpg/ditgar.jpg",
		tags: ["Two-column", "Modern", "Developer", "Data science", "Technical PM", "Dark sidebar"],
		sidebarPosition: "left",
	},
	ditto: {
		name: "Ditto",
		description: msg`Two-column, minimal and text-dense with no decorative elements; perfect for traditional industries or ATS-heavy applications.`,
		imageUrl: "/templates/jpg/ditto.jpg",
		tags: ["Two-column", "ATS friendly", "Minimal", "Text-dense", "Traditional", "No decoration"],
		sidebarPosition: "left",
	},
	gengar: {
		name: "Gengar",
		description: msg`Two-column with accent colors and clean typography; balanced choice for business analysts or operations roles.`,
		imageUrl: "/templates/jpg/gengar.jpg",
		tags: ["Two-column", "Accent colors", "Clean typography", "Business analyst", "Operations"],
		sidebarPosition: "left",
	},
	glalie: {
		name: "Glalie",
		description: msg`Two-column, minimal with light gray sidebar and subtle icons; professional and understated for legal, finance, or executive roles.`,
		imageUrl: "/templates/jpg/glalie.jpg",
		tags: ["Two-column", "Minimal", "Professional", "Legal", "Finance", "Executive", "Understated"],
		sidebarPosition: "left",
	},
	kakuna: {
		name: "Kakuna",
		description: msg`Single-column with a magenta left border accent; compact and efficient for entry-level or internship applications.`,
		imageUrl: "/templates/jpg/kakuna.jpg",
		tags: ["Single-column", "ATS friendly", "Compact", "Efficient", "Entry level", "Internship", "Magenta accent"],
		sidebarPosition: "none",
	},
	lapras: {
		name: "Lapras",
		description: msg`Single-column; polished and serious for senior or enterprise-level positions.`,
		imageUrl: "/templates/jpg/lapras.jpg",
		tags: ["Single-column", "ATS friendly", "Polished", "Senior", "Enterprise"],
		sidebarPosition: "none",
	},
	leafish: {
		name: "Leafish",
		description: msg`Two-column with a muted color sidebar; earthy and calm, suits sustainability, healthcare, or nonprofit sectors.`,
		imageUrl: "/templates/jpg/leafish.jpg",
		tags: ["Two-column", "Muted sidebar", "Earthy", "Calm", "Sustainability", "Healthcare", "Nonprofit"],
		sidebarPosition: "right",
	},
	meowth: {
		name: "Meowth",
		description: msg`Single-column with an inline three-column entry header (position · organization · period); compact and ATS-friendly, well-suited for Asian resume conventions (CN/JP/KR).`,
		imageUrl: "/templates/jpg/meowth.jpg",
		tags: ["Single-column", "ATS friendly", "Inline header", "Compact", "Asian style", "CN/JP/KR"],
		sidebarPosition: "none",
	},
	onyx: {
		name: "Onyx",
		description: msg`Single-column with a sidebar and clean grid layout; versatile for any professional or technical role.`,
		imageUrl: "/templates/jpg/onyx.jpg",
		tags: ["Single-column", "ATS friendly", "Sidebar", "Grid layout", "Versatile", "Professional", "Technical"],
		sidebarPosition: "none",
	},
	pikachu: {
		name: "Pikachu",
		description: msg`Two-column with a left margin color; simple and approachable for creative, editorial, or junior roles.`,
		imageUrl: "/templates/jpg/pikachu.jpg",
		tags: ["Two-column", "Simple", "Creative", "Editorial", "Junior", "Accent colors"],
		sidebarPosition: "left",
	},
	rhyhorn: {
		name: "Rhyhorn",
		description: msg`Single-column with a minimal top header and lots of whitespace; clean and modern for designers or content creators.`,
		imageUrl: "/templates/jpg/rhyhorn.jpg",
		tags: ["Single-column", "ATS friendly", "Minimal", "Clean", "Modern", "Designer", "Content creator", "Whitespace"],
		sidebarPosition: "none",
	},
	scizor: {
		name: "Scizor",
		description: msg`Single-column with uppercase section headings and a primary-color top rule on every page; polished for executive, consulting, or startup resumes.`,
		imageUrl: "/templates/jpg/scizor.jpg",
		tags: ["Single-column", "ATS friendly", "Uppercase headings", "Executive", "Consulting", "Startup"],
		sidebarPosition: "none",
	},
	// Dedicated to cover letters (see `templateKindMap`) — built for a single flowing letter
	// (sender header + body), not a CV's sections/sidebar.
	eevee: {
		name: "Eevee",
		description: msg`Sober letterhead: sender name and contact info above a plain rule, no color; understated and versatile for any cover letter.`,
		imageUrl: "/templates/jpg/eevee.jpg",
		tags: ["Cover letter", "Sober", "No decoration", "Versatile"],
		sidebarPosition: "none",
	},
	vulpix: {
		name: "Vulpix",
		description: msg`A single colored accent rule under the sender's name; the lightest touch of color for a cover letter.`,
		imageUrl: "/templates/jpg/vulpix.jpg",
		tags: ["Cover letter", "Accent colors", "Understated"],
		sidebarPosition: "none",
	},
	togepi: {
		name: "Togepi",
		description: msg`A soft pastel-tinted band behind the sender's name and contact info; warm and approachable for a cover letter.`,
		imageUrl: "/templates/jpg/togepi.jpg",
		tags: ["Cover letter", "Soft accent", "Pastel"],
		sidebarPosition: "none",
	},
	snorlax: {
		name: "Snorlax",
		description: msg`A bold, full-width colored header band with inverted text; the boldest color treatment for a cover letter.`,
		imageUrl: "/templates/jpg/snorlax.jpg",
		tags: ["Cover letter", "Bold", "Accent colors"],
		sidebarPosition: "none",
	},
	espeon: {
		name: "Espeon",
		description: msg`A decorative colored side column for the sender's identity, letter body beside it; distinctive structure for a cover letter.`,
		imageUrl: "/templates/jpg/espeon.jpg",
		tags: ["Cover letter", "Sidebar", "Distinctive"],
		sidebarPosition: "left",
	},
} as const satisfies Record<Template, TemplateMetadata>;

/**
 * All templates authored for `kind`, in catalog order. Does not exclude `custom` (a `kind:
 * "resume"` template) — callers that already filter it out for other reasons keep doing so
 * themselves, same as before this helper existed.
 */
export function getTemplatesForKind(kind: "resume" | "cover-letter"): [Template, TemplateMetadata][] {
	return (Object.entries(templates) as [Template, TemplateMetadata][]).filter(
		([template]) => templateKindMap[template] === kind,
	);
}

// Every CV template's static `imageUrl` is a full-resume screenshot (photo, sidebar, skill bars).
// For a cover-letter-kind preview, that fallback briefly flashes a misleading full-CV image before
// the live-rendered preview replaces it. Swap in one generic letter-shaped fallback for that brief
// window instead — the live render (which does differ per dedicated cover-letter template) takes
// over a moment later, so this only affects the loading flash, not the actual preview shown.
const COVER_LETTER_FALLBACK_IMAGE = "/templates/jpg/cover-letter-sample.jpg";

export function getTemplateMetadataForKind(
	metadata: TemplateMetadata,
	kind: "resume" | "cover-letter",
): TemplateMetadata {
	if (kind !== "cover-letter") return metadata;
	return { ...metadata, imageUrl: COVER_LETTER_FALLBACK_IMAGE };
}
