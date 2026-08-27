import { createSelectSchema } from "drizzle-zod";
import z from "zod";
import * as schema from "@reactive-resume/db/schema";
import { presetConfigSchema } from "@reactive-resume/schema/resume/template-preset";
import { templateSchema } from "@reactive-resume/schema/templates";

const presetKindSchema = z
	.enum(["resume", "cover-letter"])
	.describe("Which document kind this preset is for. Chosen once at creation and fixed — a preset is never both.");

const templatePresetSchema = createSelectSchema(schema.templatePreset, {
	id: z.string().describe("The ID of the template preset."),
	name: z.string().trim().min(1).describe("The name of the template preset."),
	slug: z.string().trim().min(1).describe("The slug of the template preset."),
	baseTemplate: templateSchema.describe("The built-in template this preset is based on."),
	config: presetConfigSchema,
	kind: presetKindSchema,
	isPublished: z.boolean().describe("Whether the preset is visible to end users in the template picker."),
	createdBy: z.string().describe("The ID of the admin who created this preset."),
	createdAt: z.date().describe("The date and time the preset was created."),
	updatedAt: z.date().describe("The date and time the preset was last updated."),
});

export const templatePresetDto = {
	list: {
		output: z.array(templatePresetSchema),
	},

	getById: {
		input: templatePresetSchema.pick({ id: true }),
		output: templatePresetSchema,
	},

	create: {
		input: templatePresetSchema.pick({ name: true, slug: true, baseTemplate: true, kind: true }).extend({
			config: presetConfigSchema.default({}),
		}),
		output: templatePresetSchema,
	},

	update: {
		input: templatePresetSchema
			.pick({ name: true, slug: true, baseTemplate: true, config: true })
			.partial()
			.extend({ id: z.string() }),
		output: templatePresetSchema,
	},

	setPublished: {
		input: templatePresetSchema.pick({ id: true, isPublished: true }),
		output: templatePresetSchema,
	},

	delete: {
		input: templatePresetSchema.pick({ id: true }),
		output: z.void(),
	},

	listPublished: {
		input: z.object({
			kind: z.enum(["resume", "cover-letter"]).describe("Only return presets for this document kind."),
		}),
		output: z.array(templatePresetSchema.pick({ id: true, name: true, slug: true, baseTemplate: true, config: true })),
	},
};
