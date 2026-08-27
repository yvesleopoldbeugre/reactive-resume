import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMock = vi.hoisted(() => ({
	select: vi.fn(),
	insert: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
}));

vi.mock("@reactive-resume/db/client", () => ({ db: dbMock }));
vi.mock("@reactive-resume/db/schema", () => ({
	templatePreset: {
		id: "id",
		name: "name",
		slug: "slug",
		baseTemplate: "base_template",
		config: "config",
		kind: "kind",
		isPublished: "is_published",
		createdBy: "created_by",
		createdAt: "created_at",
		updatedAt: "updated_at",
	},
}));
vi.mock("drizzle-orm", () => ({
	and: (...a: unknown[]) => a,
	desc: (x: unknown) => x,
	eq: (...a: unknown[]) => a,
}));

const { templatePresetService } = await import("./service");

// A `db.select(...).from(...).where(...)[.orderBy(...)]` chain that resolves to `rows`,
// whether or not `.orderBy()` is chained after `.where()`.
const createSelectChain = (rows: unknown[]) => ({
	from: () => ({
		where: () => Object.assign(Promise.resolve(rows), { orderBy: () => Promise.resolve(rows) }),
	}),
});

// A `db.insert(...).values(...).returning()` chain that resolves to `rows`.
const createInsertChain = (rows: unknown[]) => ({
	values: () => ({ returning: () => Promise.resolve(rows) }),
});

// A `db.update(...).set(...).where(...).returning()` chain that resolves to `rows`.
const createUpdateChain = (rows: unknown[]) => ({
	set: () => ({ where: () => ({ returning: () => Promise.resolve(rows) }) }),
});

// A `db.delete(...).where(...).returning()` chain that resolves to `rows`.
const createDeleteChain = (rows: unknown[]) => ({
	where: () => ({ returning: () => Promise.resolve(rows) }),
});

const preset = {
	id: "preset-1",
	name: "Bold Sidebar",
	slug: "bold-sidebar",
	baseTemplate: "onyx" as const,
	config: {},
	kind: "resume" as const,
	isPublished: false,
	createdBy: "admin-1",
	createdAt: new Date("2026-01-01T00:00:00Z"),
	updatedAt: new Date("2026-01-01T00:00:00Z"),
};

beforeEach(() => {
	dbMock.select.mockReset();
	dbMock.insert.mockReset();
	dbMock.update.mockReset();
	dbMock.delete.mockReset();
});

describe("list", () => {
	it("returns every preset ordered by newest first", async () => {
		dbMock.select.mockReturnValueOnce({ from: () => ({ orderBy: () => Promise.resolve([preset]) }) });

		await expect(templatePresetService.list()).resolves.toEqual([preset]);
	});
});

describe("getById", () => {
	it("returns the preset when found", async () => {
		dbMock.select.mockReturnValueOnce(createSelectChain([preset]));

		await expect(templatePresetService.getById({ id: "preset-1" })).resolves.toEqual(preset);
	});

	it("throws NOT_FOUND when missing", async () => {
		dbMock.select.mockReturnValueOnce(createSelectChain([]));

		await expect(templatePresetService.getById({ id: "missing" })).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});

describe("getPublishedById", () => {
	it("throws NOT_FOUND for an unpublished preset", async () => {
		dbMock.select.mockReturnValueOnce(createSelectChain([]));

		await expect(templatePresetService.getPublishedById({ id: "preset-1" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	it("returns the preset when published", async () => {
		const published = { ...preset, isPublished: true };
		dbMock.select.mockReturnValueOnce(createSelectChain([published]));

		await expect(templatePresetService.getPublishedById({ id: "preset-1" })).resolves.toEqual(published);
	});
});

describe("listPublished", () => {
	it("only returns published presets for the requested kind", async () => {
		const published = { ...preset, isPublished: true };
		dbMock.select.mockReturnValueOnce(createSelectChain([published]));

		await expect(templatePresetService.listPublished({ kind: "resume" })).resolves.toEqual([published]);
	});
});

describe("create", () => {
	it("returns the created preset", async () => {
		dbMock.insert.mockReturnValueOnce(createInsertChain([preset]));

		const result = await templatePresetService.create({
			name: preset.name,
			slug: preset.slug,
			baseTemplate: preset.baseTemplate,
			config: preset.config,
			kind: preset.kind,
			createdBy: preset.createdBy,
		});

		expect(result).toEqual(preset);
	});

	it("maps a slug conflict to TEMPLATE_PRESET_SLUG_ALREADY_EXISTS", async () => {
		dbMock.insert.mockReturnValueOnce({
			values: () => ({
				returning: () => {
					const error = new Error("duplicate key") as Error & { cause: { constraint: string } };
					error.cause = { constraint: "template_preset_slug_key" };
					return Promise.reject(error);
				},
			}),
		});

		await expect(
			templatePresetService.create({
				name: preset.name,
				slug: preset.slug,
				baseTemplate: preset.baseTemplate,
				config: preset.config,
				kind: preset.kind,
				createdBy: preset.createdBy,
			}),
		).rejects.toMatchObject({ code: "TEMPLATE_PRESET_SLUG_ALREADY_EXISTS" });
	});

	it("rejects a baseTemplate that isn't built for the given kind", async () => {
		await expect(
			templatePresetService.create({
				name: preset.name,
				slug: preset.slug,
				baseTemplate: "onyx", // a resume-kind template
				config: preset.config,
				kind: "cover-letter",
				createdBy: preset.createdBy,
			}),
		).rejects.toMatchObject({ code: "TEMPLATE_PRESET_KIND_MISMATCH" });

		expect(dbMock.insert).not.toHaveBeenCalled();
	});
});

describe("update", () => {
	it("returns the updated preset", async () => {
		const updated = { ...preset, name: "New Name" };
		dbMock.update.mockReturnValueOnce(createUpdateChain([updated]));

		await expect(templatePresetService.update({ id: "preset-1", name: "New Name" })).resolves.toEqual(updated);
	});

	it("throws NOT_FOUND when no row matches", async () => {
		dbMock.update.mockReturnValueOnce(createUpdateChain([]));

		await expect(templatePresetService.update({ id: "missing", name: "New Name" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	it("maps a slug conflict to TEMPLATE_PRESET_SLUG_ALREADY_EXISTS", async () => {
		dbMock.update.mockReturnValueOnce({
			set: () => ({
				where: () => ({
					returning: () => {
						const error = new Error("duplicate key") as Error & { cause: { constraint: string } };
						error.cause = { constraint: "template_preset_slug_key" };
						return Promise.reject(error);
					},
				}),
			}),
		});

		await expect(templatePresetService.update({ id: "preset-1", slug: "taken" })).rejects.toMatchObject({
			code: "TEMPLATE_PRESET_SLUG_ALREADY_EXISTS",
		});
	});

	it("rejects a baseTemplate that isn't built for the existing preset's kind", async () => {
		dbMock.select.mockReturnValueOnce(createSelectChain([{ kind: "resume" }]));

		await expect(
			templatePresetService.update({ id: "preset-1", baseTemplate: "eevee" }), // a cover-letter-kind template
		).rejects.toMatchObject({ code: "TEMPLATE_PRESET_KIND_MISMATCH" });

		expect(dbMock.update).not.toHaveBeenCalled();
	});

	it("throws NOT_FOUND when changing baseTemplate on a preset that no longer exists", async () => {
		dbMock.select.mockReturnValueOnce(createSelectChain([]));

		await expect(templatePresetService.update({ id: "missing", baseTemplate: "onyx" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});

describe("setPublished", () => {
	it("returns the preset with the updated publish flag", async () => {
		const published = { ...preset, isPublished: true };
		dbMock.update.mockReturnValueOnce(createUpdateChain([published]));

		await expect(templatePresetService.setPublished({ id: "preset-1", isPublished: true })).resolves.toEqual(published);
	});

	it("throws NOT_FOUND when no row matches", async () => {
		dbMock.update.mockReturnValueOnce(createUpdateChain([]));

		await expect(templatePresetService.setPublished({ id: "missing", isPublished: true })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});
});

describe("delete", () => {
	it("resolves when a row was deleted", async () => {
		dbMock.delete.mockReturnValueOnce(createDeleteChain([{ id: "preset-1" }]));

		await expect(templatePresetService.delete({ id: "preset-1" })).resolves.toBeUndefined();
	});

	it("throws NOT_FOUND when no row matches", async () => {
		dbMock.delete.mockReturnValueOnce(createDeleteChain([]));

		await expect(templatePresetService.delete({ id: "missing" })).rejects.toMatchObject({ code: "NOT_FOUND" });
	});
});
