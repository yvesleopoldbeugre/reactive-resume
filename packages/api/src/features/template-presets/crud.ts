import { adminProcedure, protectedProcedure } from "../../context";
import { templatePresetDto } from "../../dto/template-preset";
import { templatePresetService } from "./service";

export const crudRouter = {
	list: adminProcedure
		.route({
			method: "GET",
			path: "/template-presets",
			tags: ["Template Presets"],
			operationId: "listTemplatePresets",
			summary: "List all template presets",
			description:
				"Returns every template preset, published or not, most recently updated first. Requires the admin role.",
			successDescription: "A list of template presets.",
		})
		.output(templatePresetDto.list.output)
		.handler(async () => {
			return templatePresetService.list();
		}),

	getById: adminProcedure
		.route({
			method: "GET",
			path: "/template-presets/{id}",
			tags: ["Template Presets"],
			operationId: "getTemplatePreset",
			summary: "Get a template preset by ID",
			description: "Returns a single template preset with its full configuration. Requires the admin role.",
			successDescription: "The template preset.",
		})
		.input(templatePresetDto.getById.input)
		.output(templatePresetDto.getById.output)
		.handler(async ({ input }) => {
			return templatePresetService.getById({ id: input.id });
		}),

	create: adminProcedure
		.route({
			method: "POST",
			path: "/template-presets",
			tags: ["Template Presets"],
			operationId: "createTemplatePreset",
			summary: "Create a template preset",
			description:
				"Creates a new template preset (a base built-in template plus colors/typography/style rules/layout overrides). Created unpublished; use setPublished to make it visible in the picker. Requires the admin role.",
			successDescription: "The created template preset.",
		})
		.input(templatePresetDto.create.input)
		.output(templatePresetDto.create.output)
		.errors({
			TEMPLATE_PRESET_SLUG_ALREADY_EXISTS: {
				message: "A template preset with this slug already exists.",
				status: 400,
			},
			TEMPLATE_PRESET_KIND_MISMATCH: {
				message: "This base template isn't built for that document kind.",
				status: 400,
			},
		})
		.handler(async ({ input, context }) => {
			return templatePresetService.create({ ...input, createdBy: context.user.id });
		}),

	update: adminProcedure
		.route({
			method: "PUT",
			path: "/template-presets/{id}",
			tags: ["Template Presets"],
			operationId: "updateTemplatePreset",
			summary: "Update a template preset",
			description: "Updates one or more fields of a template preset. Requires the admin role.",
			successDescription: "The updated template preset.",
		})
		.input(templatePresetDto.update.input)
		.output(templatePresetDto.update.output)
		.errors({
			TEMPLATE_PRESET_SLUG_ALREADY_EXISTS: {
				message: "A template preset with this slug already exists.",
				status: 400,
			},
			TEMPLATE_PRESET_KIND_MISMATCH: {
				message: "This base template isn't built for that document kind.",
				status: 400,
			},
		})
		.handler(async ({ input }) => {
			return templatePresetService.update(input);
		}),

	setPublished: adminProcedure
		.route({
			method: "POST",
			path: "/template-presets/{id}/publish",
			tags: ["Template Presets"],
			operationId: "setTemplatePresetPublished",
			summary: "Publish or unpublish a template preset",
			description:
				"Toggles whether a template preset is visible in the end-user template picker. Unpublishing never affects resumes already created from it. Requires the admin role.",
			successDescription: "The updated template preset.",
		})
		.input(templatePresetDto.setPublished.input)
		.output(templatePresetDto.setPublished.output)
		.handler(async ({ input }) => {
			return templatePresetService.setPublished(input);
		}),

	delete: adminProcedure
		.route({
			method: "DELETE",
			path: "/template-presets/{id}",
			tags: ["Template Presets"],
			operationId: "deleteTemplatePreset",
			summary: "Delete a template preset",
			description:
				"Permanently deletes a template preset. Resumes already created from it are unaffected. Requires the admin role.",
			successDescription: "The template preset was deleted successfully.",
		})
		.input(templatePresetDto.delete.input)
		.output(templatePresetDto.delete.output)
		.handler(async ({ input }) => {
			return templatePresetService.delete({ id: input.id });
		}),

	listPublished: protectedProcedure
		.route({
			method: "GET",
			path: "/template-presets/published",
			tags: ["Template Presets"],
			operationId: "listPublishedTemplatePresets",
			summary: "List published template presets",
			description:
				"Returns every published template preset available for the given document kind (id, name, slug, base template, and config), for rendering in the resume or cover-letter template picker. Requires authentication.",
			successDescription: "A list of published template presets.",
		})
		.input(templatePresetDto.listPublished.input)
		.output(templatePresetDto.listPublished.output)
		.handler(async ({ input }) => {
			return templatePresetService.listPublished({ kind: input.kind });
		}),
};
