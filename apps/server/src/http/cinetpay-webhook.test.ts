import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ confirmPayment: vi.fn() }));

vi.mock("@reactive-resume/api/features/billing", () => ({
	billingService: { confirmPayment: mocks.confirmPayment },
}));

const { handleCinetpayWebhook } = await import("./cinetpay-webhook");

describe("handleCinetpayWebhook", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("rejects a request with no cpm_trans_id, without calling confirmPayment", async () => {
		const request = new Request("https://essor.cv/api/webhooks/cinetpay", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: "",
		});

		const response = await handleCinetpayWebhook(request);

		expect(response.status).toBe(400);
		expect(mocks.confirmPayment).not.toHaveBeenCalled();
	});

	it("always re-verifies via confirmPayment, ignoring any status the request body claims", async () => {
		mocks.confirmPayment.mockResolvedValueOnce({ accepted: true });
		const request = new Request("https://essor.cv/api/webhooks/cinetpay", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			// CinetPay's real webhook never includes a status field; even if a forged one did,
			// the handler must not read it -- it only extracts the transaction id.
			body: "cpm_trans_id=t1&cpm_result=00",
		});

		const response = await handleCinetpayWebhook(request);

		expect(response.status).toBe(200);
		expect(mocks.confirmPayment).toHaveBeenCalledWith("t1");
		expect(mocks.confirmPayment).toHaveBeenCalledTimes(1);
	});

	it("accepts a JSON body too", async () => {
		mocks.confirmPayment.mockResolvedValueOnce({ accepted: false });
		const request = new Request("https://essor.cv/api/webhooks/cinetpay", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ cpm_trans_id: "t2" }),
		});

		const response = await handleCinetpayWebhook(request);

		expect(response.status).toBe(200);
		expect(mocks.confirmPayment).toHaveBeenCalledWith("t2");
	});

	it("returns 200 for an unknown transaction (retrying would never help)", async () => {
		mocks.confirmPayment.mockRejectedValueOnce({ code: "NOT_FOUND" });
		const request = new Request("https://essor.cv/api/webhooks/cinetpay", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: "cpm_trans_id=unknown",
		});

		const response = await handleCinetpayWebhook(request);

		expect(response.status).toBe(200);
	});

	it("returns 500 for a transient failure, so CinetPay retries", async () => {
		mocks.confirmPayment.mockRejectedValueOnce(new Error("network error"));
		const request = new Request("https://essor.cv/api/webhooks/cinetpay", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: "cpm_trans_id=t1",
		});

		const response = await handleCinetpayWebhook(request);

		expect(response.status).toBe(500);
	});
});
