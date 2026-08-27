import type { PresetConfig } from "@reactive-resume/resume/preset";
import type { Template } from "@reactive-resume/schema/templates";
import * as pg from "drizzle-orm/pg-core";
import { generateId } from "@reactive-resume/utils/string";
import { user } from "./auth";

// An admin-authored starting configuration (base template + colors/typography/style rules/layout)
// that end users can pick from the resume template picker alongside the built-in templates.
export const templatePreset = pg.pgTable(
	"template_preset",
	{
		id: pg
			.text("id")
			.notNull()
			.primaryKey()
			.$defaultFn(() => generateId()),
		name: pg.text("name").notNull(),
		slug: pg.text("slug").notNull().unique(),
		baseTemplate: pg.text("base_template").notNull().$type<Template>(),
		config: pg
			.jsonb("config")
			.notNull()
			.$type<PresetConfig>()
			.$defaultFn(() => ({})),
		// A preset is authored for exactly one document kind, chosen once at creation — never both,
		// since a resume and a cover letter are shown very differently in the picker's live preview.
		kind: pg
			.text("kind", { enum: ["resume", "cover-letter"] })
			.notNull()
			.default("resume"),
		isPublished: pg.boolean("is_published").notNull().default(false),
		createdBy: pg
			.text("created_by")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: pg.timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date()),
	},
	(t) => [pg.index().on(t.isPublished, t.createdAt.desc())],
);
