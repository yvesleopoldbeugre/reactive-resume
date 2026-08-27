import { env } from "@reactive-resume/env/server";

const CINETPAY_BASE_URL = "https://api-checkout.cinetpay.com/v2";

export class CinetPayNotConfiguredError extends Error {
	constructor() {
		super("CINETPAY_API_KEY and CINETPAY_SITE_ID must be set to process a subscription payment.");
		this.name = "CinetPayNotConfiguredError";
	}
}

function getCredentials(): { apikey: string; site_id: string } {
	if (!env.CINETPAY_API_KEY || !env.CINETPAY_SITE_ID) throw new CinetPayNotConfiguredError();
	return { apikey: env.CINETPAY_API_KEY, site_id: env.CINETPAY_SITE_ID };
}

export type InitiatePaymentInput = {
	transactionId: string;
	amount: number;
	currency: string;
	description: string;
	notifyUrl: string;
	returnUrl: string;
	customerName: string;
	customerSurname: string;
	customerEmail: string;
};

export type InitiatePaymentResult = {
	paymentUrl: string;
	paymentToken: string;
};

/**
 * Initiates a CinetPay checkout. Returns a hosted `payment_url` to redirect the customer to.
 * CinetPay's own status update arrives later via the webhook, but per their documentation that
 * webhook never carries a trustworthy status itself — the caller must always follow up with
 * `verifyTransaction` before treating a payment as successful (see that function's docstring).
 */
export async function initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
	const response = await fetch(`${CINETPAY_BASE_URL}/payment`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			...getCredentials(),
			transaction_id: input.transactionId,
			amount: input.amount,
			currency: input.currency,
			description: input.description,
			notify_url: input.notifyUrl,
			return_url: input.returnUrl,
			customer_name: input.customerName,
			customer_surname: input.customerSurname,
			customer_email: input.customerEmail,
			channels: "ALL",
			lang: "fr",
		}),
	});

	const body = (await response.json()) as {
		code?: string;
		message?: string;
		data?: { payment_url?: string; payment_token?: string };
	};

	if (!response.ok || body.data?.payment_url == null || body.data.payment_token == null) {
		throw new Error(`CinetPay payment initiation failed: ${body.code ?? response.status} ${body.message ?? ""}`.trim());
	}

	return { paymentUrl: body.data.payment_url, paymentToken: body.data.payment_token };
}

export type TransactionVerification = {
	/** `true` only when CinetPay's own verification confirms the payment was accepted. */
	accepted: boolean;
	code: string;
	message: string;
	amount?: number | undefined;
	currency?: string | undefined;
	paymentMethod?: string | undefined;
	raw: Record<string, unknown>;
};

/**
 * Confirms a transaction's true status directly with CinetPay. CinetPay's `notify_url` webhook
 * deliberately does not include the payment status in its callback body (documented as a
 * man-in-the-middle mitigation) — it only tells the caller *which* transaction changed. This
 * function is the only source of truth for whether a payment actually succeeded; never derive
 * "paid" from the webhook payload alone.
 */
export async function verifyTransaction(transactionId: string): Promise<TransactionVerification> {
	const response = await fetch(`${CINETPAY_BASE_URL}/payment/check`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ ...getCredentials(), transaction_id: transactionId }),
	});

	const body = (await response.json()) as {
		code?: string;
		message?: string;
		data?: { amount?: number; currency?: string; status?: string; payment_method?: string };
	};

	return {
		accepted: body.code === "00" && body.data?.status === "ACCEPTED",
		code: body.code ?? String(response.status),
		message: body.message ?? "",
		amount: body.data?.amount,
		currency: body.data?.currency,
		paymentMethod: body.data?.payment_method,
		raw: body as Record<string, unknown>,
	};
}
