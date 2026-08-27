import z from "zod";

/**
 * A "from scratch" template's structural composition, consumed by the generic
 * `custom` template renderer (`packages/pdf/src/templates/custom`). Only resumes
 * with `metadata.template === "custom"` carry this; the 15 built-in templates
 * have their layout hardcoded in their own component and never read this field.
 *
 * Each leaf uses `.catch()` so malformed/partial data degrades to a sane default
 * instead of failing PDF rendering.
 */
export const skinSchema = z.object({
	skeleton: z
		.enum(["stacked", "columns"])
		.catch("columns")
		.describe("Single stacked column, or two side-by-side columns (sidebar + main)."),
	header: z.object({
		placement: z
			.enum(["full-width", "main", "sidebar"])
			.catch("full-width")
			.describe("Where the header sits. Only meaningful for the 'columns' skeleton; 'stacked' is always full-width."),
		align: z.enum(["center", "start"]).catch("center").describe("Header content alignment."),
		picturePlacement: z
			.enum(["none", "block-start", "inline-start", "inline-end"])
			.catch("block-start")
			.describe("Where the profile picture sits within the header, or 'none' to omit it."),
	}),
	sidebar: z.object({
		position: z
			.enum(["before", "after"])
			.catch("before")
			.describe("Whether the sidebar column renders before or after the main column. Only used by 'columns'."),
		fill: z
			.enum(["none", "solid", "tint"])
			.catch("none")
			.describe("Sidebar background: none, solid primary, or a tint of primary."),
		tintOpacity: z.number().min(0).max(1).catch(0.2).describe("Opacity used when sidebar.fill is 'tint'."),
		foreground: z
			.enum(["default", "inverted"])
			.catch("default")
			.describe("Whether sidebar text uses the default foreground color or an inverted (background) color."),
	}),
	heading: z.object({
		decoration: z
			.enum(["plain", "underline", "uppercase", "centered"])
			.catch("plain")
			.describe("Section heading decoration style."),
	}),
	divider: z
		.enum(["none", "timeline", "left-border", "top-bar"])
		.catch("none")
		.describe(
			"Structural accent: none, a timeline (dot+line), a left-border accent on item headers, or a page-top accent bar.",
		),
});

export type Skin = z.infer<typeof skinSchema>;

export const defaultSkin: Skin = {
	skeleton: "columns",
	header: { placement: "full-width", align: "center", picturePlacement: "block-start" },
	sidebar: { position: "before", fill: "none", tintOpacity: 0.2, foreground: "default" },
	heading: { decoration: "plain" },
	divider: "none",
};
