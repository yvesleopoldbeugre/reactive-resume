import type { PresetConfig } from "@reactive-resume/resume/preset";
import type { Template } from "@reactive-resume/schema/templates";
import { ORPCError } from "@orpc/client";
import { and, desc, eq } from "drizzle-orm";
import { get } from "es-toolkit/compat";
import { db } from "@reactive-resume/db/client";
import * as schema from "@reactive-resume/db/schema";
import { templateKindMap } from "@reactive-resume/schema/templates";

function assertTemplateMatchesKind(baseTemplate: Template, kind: "resume" | "cover-letter") {
	if (templateKindMap[baseTemplate] !== kind) {
		throw new ORPCError("TEMPLATE_PRESET_KIND_MISMATCH", { status: 400 });
	}
}

export const templatePresetService = {
	list: async () => {
		return db.select().from(schema.templatePreset).orderBy(desc(schema.templatePreset.createdAt));
	},

	getById: async (input: { id: string }) => {
		const [preset] = await db.select().from(schema.templatePreset).where(eq(schema.templatePreset.id, input.id));

		if (!preset) throw new ORPCError("NOT_FOUND");

		return preset;
	},

	getPublishedById: async (input: { id: string }) => {
		const [preset] = await db
			.select()
			.from(schema.templatePreset)
			.where(and(eq(schema.templatePreset.id, input.id), eq(schema.templatePreset.isPublished, true)));

		if (!preset) throw new ORPCError("NOT_FOUND");

		return preset;
	},

	listPublished: async (input: { kind: "resume" | "cover-letter" }) => {
		return db
			.select()
			.from(schema.templatePreset)
			.where(and(eq(schema.templatePreset.isPublished, true), eq(schema.templatePreset.kind, input.kind)))
			.orderBy(desc(schema.templatePreset.createdAt));
	},

	create: async (input: {
		name: string;
		slug: string;
		baseTemplate: Template;
		config: PresetConfig;
		kind: "resume" | "cover-letter";
		createdBy: string;
	}) => {
		assertTemplateMatchesKind(input.baseTemplate, input.kind);

		try {
			const [preset] = await db.insert(schema.templatePreset).values(input).returning();

			if (!preset) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create template preset" });

			return preset;
		} catch (error) {
			if (error instanceof ORPCError) throw error;

			if (get(error, "cause.constraint") === "template_preset_slug_key") {
				throw new ORPCError("TEMPLATE_PRESET_SLUG_ALREADY_EXISTS", { status: 400 });
			}

			console.error("Failed to create template preset:", error);
			throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create template preset" });
		}
	},

	update: async (input: {
		id: string;
		name?: string | undefined;
		slug?: string | undefined;
		baseTemplate?: Template | undefined;
		config?: PresetConfig | undefined;
	}) => {
		const { id, ...changes } = input;

		if (changes.baseTemplate) {
			const [existing] = await db
				.select({ kind: schema.templatePreset.kind })
				.from(schema.templatePreset)
				.where(eq(schema.templatePreset.id, id));

			if (!existing) throw new ORPCError("NOT_FOUND");
			assertTemplateMatchesKind(changes.baseTemplate, existing.kind);
		}

		try {
			const [preset] = await db
				.update(schema.templatePreset)
				.set(changes)
				.where(eq(schema.templatePreset.id, id))
				.returning();

			if (!preset) throw new ORPCError("NOT_FOUND");

			return preset;
		} catch (error) {
			if (error instanceof ORPCError) throw error;

			if (get(error, "cause.constraint") === "template_preset_slug_key") {
				throw new ORPCError("TEMPLATE_PRESET_SLUG_ALREADY_EXISTS", { status: 400 });
			}

			console.error("Failed to update template preset:", error);
			throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to update template preset" });
		}
	},

	setPublished: async (input: { id: string; isPublished: boolean }) => {
		const [preset] = await db
			.update(schema.templatePreset)
			.set({ isPublished: input.isPublished })
			.where(eq(schema.templatePreset.id, input.id))
			.returning();

		if (!preset) throw new ORPCError("NOT_FOUND");

		return preset;
	},

	delete: async (input: { id: string }) => {
		const [preset] = await db
			.delete(schema.templatePreset)
			.where(eq(schema.templatePreset.id, input.id))
			.returning({ id: schema.templatePreset.id });

		if (!preset) throw new ORPCError("NOT_FOUND");
	},
};
