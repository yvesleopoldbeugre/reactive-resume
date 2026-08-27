import { afterEach, describe, expect, it, vi } from "vitest";

const dbResult = vi.hoisted(() => ({ count: 0 }));
// A real Promise (so plain `await query` works) with a `.where()` method attached (so
// `await query.where(cond)` also works) — mirrors drizzle's awaitable query builder shape.
const makeQuery = vi.hoisted(() => () => {
	const promise = Promise.resolve([dbResult]) as Promise<Array<{ count: number }>> & { where: () => Promise<unknown> };
	promise.where = () => Promise.resolve([dbResult]);
	return promise;
});
const dbMock = vi.hoisted(() => {
	const select = vi.fn();
	select.mockReturnValue({ from: () => makeQuery() });
	return { select };
});

vi.mock("@reactive-resume/db/client", () => ({ db: dbMock }));
vi.mock("@reactive-resume/db/schema", () => ({
	user: { __table: "user" },
	resume: { __table: "resume", kind: "resume.kind" },
}));
vi.mock("drizzle-orm", () => ({ count: () => "count(*)", eq: (a: unknown, b: unknown) => [a, b] }));

afterEach(() => {
	dbMock.select.mockReset();
	// ponytail: clear in-memory cache so each test starts with a fresh fetch
	clearStatisticsCache();
});

const { statisticsService, clearStatisticsCache } = await import("./service");

describe("statisticsService.user.getCount", () => {
	it("returns the DB count when the fetcher succeeds", async () => {
		dbResult.count = 42;
		dbMock.select.mockReturnValue({ from: () => makeQuery() });
		await expect(statisticsService.user.getCount()).resolves.toBe(42);
	});

	it("falls back to the last-known value when the DB throws", async () => {
		dbMock.select.mockImplementationOnce(() => {
			throw new Error("db down");
		});
		const value = await statisticsService.user.getCount();
		// Last known starts at 0 for a fresh instance with no real usage data yet.
		expect(value).toBe(0);
	});
});

describe("statisticsService.resume.getCount", () => {
	it("returns the DB count for resume", async () => {
		dbResult.count = 7;
		dbMock.select.mockReturnValue({ from: () => makeQuery() });
		await expect(statisticsService.resume.getCount()).resolves.toBe(7);
	});
});

describe("statisticsService.coverLetter.getCount", () => {
	it("returns the DB count for cover letters", async () => {
		dbResult.count = 3;
		dbMock.select.mockReturnValue({ from: () => makeQuery() });
		await expect(statisticsService.coverLetter.getCount()).resolves.toBe(3);
	});
});
