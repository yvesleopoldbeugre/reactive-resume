import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultResumeData } from "@reactive-resume/schema/resume/default";
import { templateSchema } from "@reactive-resume/schema/templates";

// Characterization tests for the resume service. The goal is to pin down CURRENT behavior
// (CRUD / lock / password / statistics branching) so later changes are deliberate. The DB
// layer and side-effecting helpers are mocked; the branching in service.ts is what's under test.

const dbMock = vi.hoisted(() => ({
	select: vi.fn(),
	insert: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
	transaction: vi.fn(),
}));
const hashMock = vi.hoisted(() => vi.fn());
const compareMock = vi.hoisted(() => vi.fn());
const publishResumeUpdatedMock = vi.hoisted(() => vi.fn());
const grantResumeAccessMock = vi.hoisted(() => vi.fn());
const hasResumeAccessMock = vi.hoisted(() => vi.fn());
const storageDeleteMock = vi.hoisted(() => vi.fn());
const getMySubscriptionMock = vi.hoisted(() => vi.fn());
const countDocumentsMock = vi.hoisted(() => vi.fn());

vi.mock("@reactive-resume/db/client", () => ({ db: dbMock }));
vi.mock("@reactive-resume/db/schema", () => ({
	resume: {
		id: "id",
		userId: "user_id",
		slug: "slug",
		name: "name",
		tags: "tags",
		data: "data",
		isPublic: "is_public",
		isLocked: "is_locked",
		password: "password",
		updatedAt: "updated_at",
		createdAt: "created_at",
	},
	resumeStatistics: {
		resumeId: "resume_id",
		views: "views",
		downloads: "downloads",
		lastViewedAt: "last_viewed_at",
		lastDownloadedAt: "last_downloaded_at",
	},
	resumeStatisticsDaily: {
		resumeId: "resume_id",
		date: "date",
		views: "views",
		downloads: "downloads",
	},
	resumeVersion: {
		id: "id",
		resumeId: "resume_id",
		userId: "user_id",
		data: "data",
		label: "label",
		createdAt: "created_at",
	},
	resumeAnalysis: { resumeId: "resume_id", analysis: "analysis" },
	user: { id: "id", username: "username" },
}));
vi.mock("drizzle-orm", () => ({
	and: (...a: unknown[]) => a,
	arrayContains: (...a: unknown[]) => a,
	asc: (x: unknown) => x,
	desc: (x: unknown) => x,
	eq: (...a: unknown[]) => a,
	gte: (...a: unknown[]) => a,
	isNotNull: (...a: unknown[]) => a,
	notInArray: (...a: unknown[]) => a,
	sql: Object.assign((strings: TemplateStringsArray, ...values: unknown[]) => ({ strings, values }), {
		join: (values: unknown[]) => values,
	}),
}));
vi.mock("bcrypt", () => ({ hash: hashMock, compare: compareMock }));
vi.mock("./events", () => ({ publishResumeUpdated: publishResumeUpdatedMock }));
vi.mock("./access", () => ({
	grantResumeAccess: grantResumeAccessMock,
	hasResumeAccess: hasResumeAccessMock,
}));
vi.mock("../storage/service", () => ({
	getStorageService: () => ({ delete: storageDeleteMock }),
}));
vi.mock("../billing/service", () => ({
	billingService: {
		getMySubscription: getMySubscriptionMock,
		countDocuments: countDocumentsMock,
	},
}));

const { resumeService } = await import("./service");

// A `db.update(...).set(...).where(...).returning(...)` chain that resolves to `rows`.
const createUpdateChain = (rows: unknown[]) => {
	const returning = vi.fn(() => Promise.resolve(rows));
	const where = vi.fn(() => ({ returning }));
	const set = vi.fn(() => ({ where }));
	return { chain: { set }, set, where, returning };
};

// A `db.select(...).from(...).where(...)` chain that resolves to `rows`.
const createSelectChain = (rows: unknown[]) => ({
	from: () => ({ where: () => Promise.resolve(rows) }),
});

beforeEach(() => {
	dbMock.select.mockReset();
	dbMock.insert.mockReset();
	dbMock.update.mockReset();
	dbMock.delete.mockReset();
	dbMock.transaction.mockReset();
	hashMock.mockReset();
	compareMock.mockReset();
	publishResumeUpdatedMock.mockReset();
	grantResumeAccessMock.mockReset();
	hasResumeAccessMock.mockReset();
	storageDeleteMock.mockReset();
	getMySubscriptionMock.mockReset();
	countDocumentsMock.mockReset();
	hashMock.mockResolvedValue("hashed-password");
	publishResumeUpdatedMock.mockResolvedValue(undefined);
	storageDeleteMock.mockResolvedValue(true);
	// Unlimited plan, every template allowed -- billing's own guard logic is exercised by the
	// "create" and "update" tests below that explicitly override this per case.
	getMySubscriptionMock.mockResolvedValue({
		plan: { id: "pro-monthly", allowedTemplates: templateSchema.options },
		currentPeriodEnd: null,
	});
	countDocumentsMock.mockResolvedValue(0);
});

it("imports", () => {
	expect(resumeService).toBeDefined();
});

describe("create", () => {
	it("throws DOCUMENT_QUOTA_EXCEEDED when the plan's document limit is already reached", async () => {
		getMySubscriptionMock.mockResolvedValue({ plan: { id: "free", documentLimit: 3 }, currentPeriodEnd: null });
		countDocumentsMock.mockResolvedValue(3);

		await expect(
			resumeService.create({ userId: "u1", name: "New", slug: "new", tags: [], locale: "en-US" }),
		).rejects.toMatchObject({ code: "DOCUMENT_QUOTA_EXCEEDED" });
		expect(dbMock.insert).not.toHaveBeenCalled();
	});

	it("allows creation right up to the document limit, and blocks the one after", async () => {
		getMySubscriptionMock.mockResolvedValue({
			plan: { id: "free", documentLimit: 3, allowedTemplates: ["onyx"] },
			currentPeriodEnd: null,
		});
		countDocumentsMock.mockResolvedValue(2);
		dbMock.insert.mockReturnValueOnce({ values: vi.fn(() => Promise.resolve()) });

		await expect(
			resumeService.create({ userId: "u1", name: "New", slug: "new", tags: [], locale: "en-US" }),
		).resolves.toEqual(expect.any(String));
	});

	it("never checks the document count when the plan is unlimited (documentLimit: null)", async () => {
		getMySubscriptionMock.mockResolvedValue({
			plan: { id: "pro-monthly", documentLimit: null, allowedTemplates: ["onyx"] },
			currentPeriodEnd: null,
		});
		dbMock.insert.mockReturnValueOnce({ values: vi.fn(() => Promise.resolve()) });

		await resumeService.create({ userId: "u1", name: "New", slug: "new", tags: [], locale: "en-US" });

		expect(countDocumentsMock).not.toHaveBeenCalled();
	});

	it("forwards isAdmin to billingService.getMySubscription so admins bypass quota/template checks", async () => {
		dbMock.insert.mockReturnValueOnce({ values: vi.fn(() => Promise.resolve()) });

		await resumeService.create({ userId: "u1", name: "New", slug: "new", tags: [], locale: "en-US", isAdmin: true });

		expect(getMySubscriptionMock).toHaveBeenCalledWith({ userId: "u1", isAdmin: true });
	});

	it("throws TEMPLATE_LOCKED when the requested template isn't in the free plan's real allowed list", async () => {
		getMySubscriptionMock.mockResolvedValue({
			plan: { id: "free", documentLimit: null, allowedTemplates: ["azurill"] },
			currentPeriodEnd: null,
		});
		// "gengar" is a real CV template but not one of the free plan's unlocked templates.
		const data = structuredClone(defaultResumeData);
		data.metadata.template = "gengar";

		await expect(
			resumeService.create({ userId: "u1", name: "New", slug: "new", tags: [], locale: "en-US", data }),
		).rejects.toMatchObject({ code: "TEMPLATE_LOCKED" });
		expect(dbMock.insert).not.toHaveBeenCalled();
	});

	it("allows creation with a template that is in the free plan's allowed list", async () => {
		getMySubscriptionMock.mockResolvedValue({
			plan: { id: "free", documentLimit: null, allowedTemplates: ["azurill"] },
			currentPeriodEnd: null,
		});
		dbMock.insert.mockReturnValueOnce({ values: vi.fn(() => Promise.resolve()) });
		const data = structuredClone(defaultResumeData);
		data.metadata.template = "azurill";

		await expect(
			resumeService.create({ userId: "u1", name: "New", slug: "new", tags: [], locale: "en-US", data }),
		).resolves.toEqual(expect.any(String));
	});
});

describe("update", () => {
	it("throws RESUME_LOCKED when the pre-read reports the resume is locked", async () => {
		dbMock.select.mockReturnValueOnce(createSelectChain([{ isLocked: true }]));

		await expect(resumeService.update({ id: "r1", userId: "u1", name: "New" })).rejects.toMatchObject({
			code: "RESUME_LOCKED",
		});
	});

	it("returns the updated row on success", async () => {
		dbMock.select.mockReturnValueOnce(createSelectChain([{ isLocked: false }]));
		const row = {
			id: "r1",
			name: "New",
			slug: "slug",
			tags: [],
			data: {},
			isPublic: false,
			isLocked: false,
			updatedAt: new Date("2026-01-01T00:00:00Z"),
			hasPassword: false,
		};
		dbMock.update.mockReturnValueOnce(createUpdateChain([row]).chain);

		const result = await resumeService.update({ id: "r1", userId: "u1", name: "New" });

		expect(result).toEqual(row);
		expect(publishResumeUpdatedMock).toHaveBeenCalledTimes(1);
	});

	it("throws NOT_FOUND when the UPDATE ... RETURNING matches no row", async () => {
		dbMock.select.mockReturnValueOnce(createSelectChain([{ isLocked: false }]));
		dbMock.update.mockReturnValueOnce(createUpdateChain([]).chain);

		await expect(resumeService.update({ id: "r1", userId: "u1", name: "New" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
	});

	it("maps a resume_slug_user_id_unique violation to RESUME_SLUG_ALREADY_EXISTS", async () => {
		dbMock.select.mockReturnValueOnce(createSelectChain([{ isLocked: false }]));
		dbMock.update.mockReturnValueOnce({
			set: () => ({
				where: () => ({
					returning: () => {
						const error = new Error("duplicate key") as Error & { cause: { constraint: string } };
						error.cause = { constraint: "resume_slug_user_id_unique" };
						return Promise.reject(error);
					},
				}),
			}),
		});

		await expect(resumeService.update({ id: "r1", userId: "u1", slug: "taken" })).rejects.toMatchObject({
			code: "RESUME_SLUG_ALREADY_EXISTS",
		});
	});

	it("throws TEMPLATE_LOCKED when switching to a template outside the plan, without writing", async () => {
		getMySubscriptionMock.mockResolvedValue({
			plan: { id: "free", documentLimit: null, allowedTemplates: ["azurill"] },
			currentPeriodEnd: null,
		});
		const existing = structuredClone(defaultResumeData);
		existing.metadata.template = "azurill";
		dbMock.select.mockReturnValueOnce(createSelectChain([{ isLocked: false, data: existing }]));
		const next = structuredClone(defaultResumeData);
		next.metadata.template = "gengar";

		await expect(resumeService.update({ id: "r1", userId: "u1", data: next })).rejects.toMatchObject({
			code: "TEMPLATE_LOCKED",
		});
		expect(dbMock.update).not.toHaveBeenCalled();
	});

	it("forwards isAdmin to billingService.getMySubscription on a template switch", async () => {
		const existing = structuredClone(defaultResumeData);
		existing.metadata.template = "azurill";
		dbMock.select.mockReturnValueOnce(createSelectChain([{ isLocked: false, data: existing }]));
		const next = structuredClone(defaultResumeData);
		next.metadata.template = "gengar";
		const row = { ...existing, id: "r1", updatedAt: new Date("2026-01-01T00:00:00Z"), hasPassword: false };
		dbMock.update.mockReturnValueOnce(createUpdateChain([row]).chain);

		await resumeService.update({ id: "r1", userId: "u1", data: next, isAdmin: true });

		expect(getMySubscriptionMock).toHaveBeenCalledWith({ userId: "u1", isAdmin: true });
	});

	it("does not re-check the template when a document already on a now-locked template is edited without switching", async () => {
		getMySubscriptionMock.mockResolvedValue({ plan: { id: "free", documentLimit: null }, currentPeriodEnd: null });
		// The document is already on "gengar" (e.g. from before a downgrade) -- editing it without
		// changing the template must not be blocked, per the "never lock existing documents" design.
		const existing = structuredClone(defaultResumeData);
		existing.metadata.template = "gengar";
		dbMock.select.mockReturnValueOnce(createSelectChain([{ isLocked: false, data: existing }]));
		const next = structuredClone(existing);
		next.basics = { ...next.basics, headline: "Updated" };
		const row = { ...existing, id: "r1", updatedAt: new Date("2026-01-01T00:00:00Z"), hasPassword: false };
		dbMock.update.mockReturnValueOnce(createUpdateChain([row]).chain);

		await expect(resumeService.update({ id: "r1", userId: "u1", data: next })).resolves.toEqual(row);
	});
});

describe("setLocked", () => {
	it("resolves and notifies on success (mutation: lock)", async () => {
		dbMock.update.mockReturnValueOnce(
			createUpdateChain([{ id: "r1", updatedAt: new Date("2026-01-01T00:00:00Z") }]).chain,
		);

		await expect(resumeService.setLocked({ id: "r1", userId: "u1", isLocked: true })).resolves.toBeUndefined();

		expect(publishResumeUpdatedMock).toHaveBeenCalledTimes(1);
		expect(publishResumeUpdatedMock).toHaveBeenCalledWith(expect.objectContaining({ mutation: "lock" }));
	});

	// Plan 003: no matching row now rejects with NOT_FOUND (previously a silent resolve).
	it("throws NOT_FOUND when no row matches, without notifying", async () => {
		dbMock.update.mockReturnValueOnce(createUpdateChain([]).chain);

		await expect(resumeService.setLocked({ id: "r1", userId: "u1", isLocked: true })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
		expect(publishResumeUpdatedMock).not.toHaveBeenCalled();
	});
});

describe("setPassword", () => {
	it("hashes the password then resolves and notifies on success (mutation: password)", async () => {
		dbMock.update.mockReturnValueOnce(
			createUpdateChain([{ id: "r1", updatedAt: new Date("2026-01-01T00:00:00Z") }]).chain,
		);

		await expect(resumeService.setPassword({ id: "r1", userId: "u1", password: "secret" })).resolves.toBeUndefined();

		expect(hashMock).toHaveBeenCalledWith("secret", 10);
		expect(publishResumeUpdatedMock).toHaveBeenCalledTimes(1);
		expect(publishResumeUpdatedMock).toHaveBeenCalledWith(expect.objectContaining({ mutation: "password" }));
	});

	// Plan 003: no matching row now rejects with NOT_FOUND (previously a silent resolve).
	it("throws NOT_FOUND when no row matches, without notifying", async () => {
		dbMock.update.mockReturnValueOnce(createUpdateChain([]).chain);

		await expect(resumeService.setPassword({ id: "r1", userId: "u1", password: "secret" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
		expect(publishResumeUpdatedMock).not.toHaveBeenCalled();
	});
});

describe("removePassword", () => {
	it("resolves and notifies on success (mutation: password)", async () => {
		dbMock.update.mockReturnValueOnce(
			createUpdateChain([{ id: "r1", updatedAt: new Date("2026-01-01T00:00:00Z") }]).chain,
		);

		await expect(resumeService.removePassword({ id: "r1", userId: "u1" })).resolves.toBeUndefined();

		expect(publishResumeUpdatedMock).toHaveBeenCalledTimes(1);
		expect(publishResumeUpdatedMock).toHaveBeenCalledWith(expect.objectContaining({ mutation: "password" }));
	});

	// Plan 003: no matching row now rejects with NOT_FOUND (previously a silent resolve).
	it("throws NOT_FOUND when no row matches, without notifying", async () => {
		dbMock.update.mockReturnValueOnce(createUpdateChain([]).chain);

		await expect(resumeService.removePassword({ id: "r1", userId: "u1" })).rejects.toMatchObject({
			code: "NOT_FOUND",
		});
		expect(publishResumeUpdatedMock).not.toHaveBeenCalled();
	});
});

describe("verifyPassword", () => {
	it("throws INVALID_PASSWORD when no matching row is found", async () => {
		dbMock.select.mockReturnValueOnce({
			from: () => ({ innerJoin: () => ({ where: () => Promise.resolve([]) }) }),
		});

		await expect(resumeService.verifyPassword({ slug: "s", username: "u", password: "p" })).rejects.toMatchObject({
			code: "INVALID_PASSWORD",
		});
	});

	it("throws INVALID_PASSWORD when bcrypt.compare returns false", async () => {
		dbMock.select.mockReturnValueOnce({
			from: () => ({ innerJoin: () => ({ where: () => Promise.resolve([{ id: "r1", password: "hash" }]) }) }),
		});
		compareMock.mockResolvedValueOnce(false);

		await expect(resumeService.verifyPassword({ slug: "s", username: "u", password: "p" })).rejects.toMatchObject({
			code: "INVALID_PASSWORD",
		});
	});

	it("returns true and grants access when bcrypt.compare returns true", async () => {
		dbMock.select.mockReturnValueOnce({
			from: () => ({ innerJoin: () => ({ where: () => Promise.resolve([{ id: "r1", password: "hash" }]) }) }),
		});
		compareMock.mockResolvedValueOnce(true);
		const responseHeaders = new Headers();

		const result = await resumeService.verifyPassword({
			slug: "s",
			username: "u",
			password: "p",
			responseHeaders,
		});

		expect(result).toBe(true);
		expect(grantResumeAccessMock).toHaveBeenCalledWith(responseHeaders, "r1", "hash");
	});
});

describe("delete", () => {
	const runTransaction = (tx: unknown) => {
		dbMock.transaction.mockImplementationOnce(async (cb: (tx: unknown) => Promise<unknown>) => cb(tx));
	};

	it("throws NOT_FOUND when the row is missing", async () => {
		runTransaction({
			select: () => createSelectChain([]),
		});

		await expect(resumeService.delete({ id: "r1", userId: "u1" })).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("throws RESUME_LOCKED when the row is locked", async () => {
		runTransaction({
			select: () => createSelectChain([{ isLocked: true }]),
		});

		await expect(resumeService.delete({ id: "r1", userId: "u1" })).rejects.toMatchObject({
			code: "RESUME_LOCKED",
		});
	});

	it("deletes storage for screenshot and pdf keys on success", async () => {
		const deleteWhere = vi.fn(() => Promise.resolve());
		runTransaction({
			select: () => createSelectChain([{ isLocked: false }]),
			delete: () => ({ where: deleteWhere }),
		});

		await resumeService.delete({ id: "r1", userId: "u1" });

		expect(deleteWhere).toHaveBeenCalledTimes(1);
		expect(storageDeleteMock).toHaveBeenCalledWith("uploads/u1/screenshots/r1");
		expect(storageDeleteMock).toHaveBeenCalledWith("uploads/u1/pdfs/r1");
		expect(publishResumeUpdatedMock).toHaveBeenCalledWith(expect.objectContaining({ mutation: "delete" }));
	});
});

describe("statistics.increment", () => {
	it("writes both resumeStatistics and resumeStatisticsDaily inside one transaction", async () => {
		const values = vi.fn(() => ({ onConflictDoUpdate: vi.fn(() => Promise.resolve()) }));
		const txInsert = vi.fn(() => ({ values }));
		dbMock.transaction.mockImplementationOnce(async (cb: (tx: unknown) => Promise<unknown>) =>
			cb({ insert: txInsert }),
		);

		await resumeService.statistics.increment({ id: "r1", views: true });

		expect(dbMock.transaction).toHaveBeenCalledTimes(1);
		expect(txInsert).toHaveBeenCalledTimes(2);
	});
});
