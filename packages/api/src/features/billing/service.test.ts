import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMock = vi.hoisted(() => ({
	select: vi.fn(),
	insert: vi.fn(),
	update: vi.fn(),
}));
const initiatePaymentMock = vi.hoisted(() => vi.fn());
const verifyTransactionMock = vi.hoisted(() => vi.fn());

vi.mock("@reactive-resume/db/client", () => ({ db: dbMock }));
vi.mock("@reactive-resume/db/schema", () => ({
	subscription: { userId: "user_id", status: "status" },
	paymentTransaction: {
		id: "id",
		userId: "user_id",
		planId: "plan_id",
		cinetpayTransactionId: "cinetpay_transaction_id",
		status: "status",
	},
	resume: { id: "id", userId: "user_id" },
	plan: { id: "id" },
}));
vi.mock("drizzle-orm", () => ({
	and: (...a: unknown[]) => a,
	eq: (...a: unknown[]) => a,
}));
vi.mock("@reactive-resume/env/server", () => ({ env: { APP_URL: "https://essor.cv" } }));
vi.mock("./cinetpay-client", () => ({
	initiatePayment: initiatePaymentMock,
	verifyTransaction: verifyTransactionMock,
}));

const { billingService } = await import("./service");

// A `db.select(...).from(...).where(...)` chain that resolves to `rows`.
const createSelectChain = (rows: unknown[]) => ({ from: () => ({ where: () => Promise.resolve(rows) }) });

// A `db.select(...).from(...)` chain (no `.where()`) for the plan catalog lookup. Empty rows makes
// `getPlanCatalog` fall back to the real static catalog, which is what the assertions below expect.
const createPlanCatalogChain = () => ({ from: () => Promise.resolve([]) });

beforeEach(() => {
	dbMock.select.mockReset();
	dbMock.insert.mockReset();
	dbMock.update.mockReset();
	initiatePaymentMock.mockReset();
	verifyTransactionMock.mockReset();
});

describe("getMySubscription", () => {
	it("returns the free plan when the user has no subscription row", async () => {
		dbMock.select.mockReturnValueOnce(createSelectChain([]));
		dbMock.select.mockReturnValueOnce(createPlanCatalogChain());

		const result = await billingService.getMySubscription({ userId: "u1" });

		expect(result.plan.id).toBe("free");
		expect(result.currentPeriodEnd).toBeNull();
	});

	it("returns the subscribed plan when the row is active and not expired", async () => {
		const currentPeriodEnd = new Date(Date.now() + 1000 * 60 * 60 * 24);
		dbMock.select.mockReturnValueOnce(createSelectChain([{ planId: "pro-monthly", currentPeriodEnd }]));
		dbMock.select.mockReturnValueOnce(createPlanCatalogChain());

		const result = await billingService.getMySubscription({ userId: "u1" });

		expect(result.plan.id).toBe("pro-monthly");
		expect(result.currentPeriodEnd).toBe(currentPeriodEnd);
	});

	it("falls back to the free plan when the row's period has already ended", async () => {
		const currentPeriodEnd = new Date(Date.now() - 1000);
		dbMock.select.mockReturnValueOnce(createSelectChain([{ planId: "pro-monthly", currentPeriodEnd }]));
		dbMock.select.mockReturnValueOnce(createPlanCatalogChain());

		const result = await billingService.getMySubscription({ userId: "u1" });

		expect(result.plan.id).toBe("free");
	});

	it("gives admins unlimited documents and every template without a subscription row, and skips the DB entirely", async () => {
		const result = await billingService.getMySubscription({ userId: "u1", isAdmin: true });

		expect(result.plan.documentLimit).toBeNull();
		expect(result.plan.allowedTemplates.length).toBeGreaterThan(6); // more than the free plan's set
		expect(result.currentPeriodEnd).toBeNull();
		expect(dbMock.select).not.toHaveBeenCalled();
	});
});

describe("createCheckout", () => {
	it("throws BAD_REQUEST for the free plan, without inserting a transaction or calling CinetPay", async () => {
		await expect(
			billingService.createCheckout({
				userId: "u1",
				planId: "free",
				customerName: "Yves",
				customerSurname: "Beugre",
				customerEmail: "yves@example.com",
			}),
		).rejects.toMatchObject({ code: "BAD_REQUEST" });
		expect(dbMock.insert).not.toHaveBeenCalled();
		expect(initiatePaymentMock).not.toHaveBeenCalled();
	});

	it("inserts a pending transaction and returns CinetPay's payment URL", async () => {
		dbMock.select.mockReturnValueOnce(createPlanCatalogChain());
		const values = vi.fn(() => Promise.resolve());
		dbMock.insert.mockReturnValueOnce({ values });
		initiatePaymentMock.mockResolvedValueOnce({ paymentUrl: "https://pay/1", paymentToken: "tok" });

		const result = await billingService.createCheckout({
			userId: "u1",
			planId: "pro-monthly",
			customerName: "Yves",
			customerSurname: "Beugre",
			customerEmail: "yves@example.com",
		});

		expect(result).toEqual({ paymentUrl: "https://pay/1" });
		expect(values).toHaveBeenCalledWith(
			expect.objectContaining({ userId: "u1", planId: "pro-monthly", amount: 2500, status: "pending" }),
		);
		expect(initiatePaymentMock).toHaveBeenCalledWith(
			expect.objectContaining({ notifyUrl: "https://essor.cv/api/webhooks/cinetpay" }),
		);
	});

	it("never inserts a transaction row when CinetPay initiation fails (no orphaned pending rows)", async () => {
		dbMock.select.mockReturnValueOnce(createPlanCatalogChain());
		initiatePaymentMock.mockRejectedValueOnce(new Error("CinetPay not configured"));

		await expect(
			billingService.createCheckout({
				userId: "u1",
				planId: "pro-monthly",
				customerName: "Yves",
				customerSurname: "Beugre",
				customerEmail: "yves@example.com",
			}),
		).rejects.toThrow("CinetPay not configured");
		expect(dbMock.insert).not.toHaveBeenCalled();
	});
});

describe("confirmPayment", () => {
	it("throws NOT_FOUND for an unknown transaction id", async () => {
		dbMock.select.mockReturnValueOnce(createSelectChain([]));

		await expect(billingService.confirmPayment("unknown")).rejects.toMatchObject({ code: "NOT_FOUND" });
	});

	it("is idempotent: a transaction already marked success is reported accepted without re-verifying", async () => {
		dbMock.select.mockReturnValueOnce(createSelectChain([{ id: "tx1", status: "success" }]));

		const result = await billingService.confirmPayment("t1");

		expect(result).toEqual({ accepted: true });
		expect(verifyTransactionMock).not.toHaveBeenCalled();
	});

	it("always re-verifies with CinetPay before activating -- never trusts the webhook body alone", async () => {
		dbMock.select.mockReturnValueOnce(
			createSelectChain([{ id: "tx1", userId: "u1", planId: "pro-monthly", status: "pending" }]),
		);
		dbMock.select.mockReturnValueOnce(createPlanCatalogChain());
		const updateSet = vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) }));
		dbMock.update.mockReturnValueOnce({ set: updateSet });
		const upsert = vi.fn(() => Promise.resolve());
		dbMock.insert.mockReturnValueOnce({ values: () => ({ onConflictDoUpdate: upsert }) });
		verifyTransactionMock.mockResolvedValueOnce({ accepted: true, code: "00", message: "SUCCES", raw: {} });

		const result = await billingService.confirmPayment("t1");

		expect(verifyTransactionMock).toHaveBeenCalledWith("t1");
		expect(result).toEqual({ accepted: true });
		expect(updateSet).toHaveBeenCalledWith(expect.objectContaining({ status: "success" }));
		expect(upsert).toHaveBeenCalledWith(
			expect.objectContaining({ target: "user_id", set: expect.objectContaining({ status: "active" }) }),
		);
	});

	it("marks the transaction failed and does not activate a subscription when CinetPay refuses it", async () => {
		dbMock.select.mockReturnValueOnce(
			createSelectChain([{ id: "tx1", userId: "u1", planId: "pro-monthly", status: "pending" }]),
		);
		const updateSet = vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) }));
		dbMock.update.mockReturnValueOnce({ set: updateSet });
		verifyTransactionMock.mockResolvedValueOnce({ accepted: false, code: "627", message: "REFUSED", raw: {} });

		const result = await billingService.confirmPayment("t1");

		expect(result).toEqual({ accepted: false });
		expect(updateSet).toHaveBeenCalledWith(expect.objectContaining({ status: "failed" }));
		expect(dbMock.insert).not.toHaveBeenCalled();
	});
});
