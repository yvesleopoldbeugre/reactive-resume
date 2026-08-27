import { beforeEach, describe, expect, it, vi } from "vitest";

const envMock = vi.hoisted(() => ({ CINETPAY_API_KEY: "key", CINETPAY_SITE_ID: "site" }) as Record<string, unknown>);
vi.mock("@reactive-resume/env/server", () => ({ env: envMock }));

const fetchMock = vi.hoisted(() => vi.fn());
vi.stubGlobal("fetch", fetchMock);

const jsonResponse = (body: unknown, ok = true) => ({ ok, status: ok ? 200 : 400, json: () => Promise.resolve(body) });

const { CinetPayNotConfiguredError, initiatePayment, verifyTransaction } = await import("./cinetpay-client");

beforeEach(() => {
	fetchMock.mockReset();
	envMock.CINETPAY_API_KEY = "key";
	envMock.CINETPAY_SITE_ID = "site";
});

describe("initiatePayment", () => {
	const input = {
		transactionId: "t1",
		amount: 2500,
		currency: "XOF",
		description: "Essor — Pro mensuel",
		notifyUrl: "https://essor.cv/api/webhooks/cinetpay",
		returnUrl: "https://essor.cv/dashboard/settings/billing",
		customerName: "Yves",
		customerSurname: "Beugre",
		customerEmail: "yves@example.com",
	};

	it("throws CinetPayNotConfiguredError when credentials are missing, without calling fetch", async () => {
		envMock.CINETPAY_API_KEY = undefined;

		await expect(initiatePayment(input)).rejects.toBeInstanceOf(CinetPayNotConfiguredError);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("posts to the CinetPay checkout endpoint and returns the payment URL and token", async () => {
		fetchMock.mockResolvedValueOnce(
			jsonResponse({ code: "201", message: "CREATED", data: { payment_url: "https://pay/1", payment_token: "tok" } }),
		);

		const result = await initiatePayment(input);

		expect(result).toEqual({ paymentUrl: "https://pay/1", paymentToken: "tok" });
		const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(url).toBe("https://api-checkout.cinetpay.com/v2/payment");
		const sentBody = JSON.parse(options.body as string);
		expect(sentBody).toMatchObject({
			apikey: "key",
			site_id: "site",
			transaction_id: "t1",
			amount: 2500,
			customer_email: "yves@example.com",
		});
	});

	it("throws when the response is not ok", async () => {
		fetchMock.mockResolvedValueOnce(jsonResponse({ code: "600", message: "INVALID_DATA" }, false));

		await expect(initiatePayment(input)).rejects.toThrow(/CinetPay payment initiation failed/);
	});

	it("throws when the response is ok but missing a payment URL", async () => {
		fetchMock.mockResolvedValueOnce(jsonResponse({ code: "00", message: "SUCCESS", data: {} }));

		await expect(initiatePayment(input)).rejects.toThrow(/CinetPay payment initiation failed/);
	});
});

describe("verifyTransaction", () => {
	it("throws CinetPayNotConfiguredError when credentials are missing, without calling fetch", async () => {
		envMock.CINETPAY_SITE_ID = undefined;

		await expect(verifyTransaction("t1")).rejects.toBeInstanceOf(CinetPayNotConfiguredError);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("reports accepted only when code is '00' AND status is ACCEPTED", async () => {
		fetchMock.mockResolvedValueOnce(
			jsonResponse({ code: "00", message: "SUCCES", data: { status: "ACCEPTED", amount: 2500, currency: "XOF" } }),
		);

		const result = await verifyTransaction("t1");

		expect(result.accepted).toBe(true);
		expect(result.amount).toBe(2500);
	});

	it("reports not accepted when code is '00' but status is REFUSED", async () => {
		fetchMock.mockResolvedValueOnce(jsonResponse({ code: "00", message: "SUCCES", data: { status: "REFUSED" } }));

		const result = await verifyTransaction("t1");

		expect(result.accepted).toBe(false);
	});

	it("reports not accepted when the transaction cannot be found, without throwing", async () => {
		fetchMock.mockResolvedValueOnce(jsonResponse({ code: "627", message: "TRANSACTION NOT FOUND" }));

		const result = await verifyTransaction("t1");

		expect(result.accepted).toBe(false);
		expect(result.code).toBe("627");
	});
});
