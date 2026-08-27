import { billingService } from "@reactive-resume/api/features/billing";

/**
 * CinetPay's `notify_url` webhook deliberately carries no payment status, only the transaction id
 * (documented as an anti-MITM measure) — `billingService.confirmPayment` always re-verifies with
 * CinetPay directly before activating anything, so this handler never trusts the request body.
 */
export async function handleCinetpayWebhook(request: Request) {
	const contentType = request.headers.get("content-type") ?? "";
	const params = contentType.includes("application/json")
		? ((await request.json()) as Record<string, unknown>)
		: Object.fromEntries(new URLSearchParams(await request.text()));

	const transactionId = params.cpm_trans_id;
	if (typeof transactionId !== "string" || !transactionId) {
		return new Response("Missing cpm_trans_id", { status: 400 });
	}

	try {
		await billingService.confirmPayment(transactionId);
		return new Response(null, { status: 200 });
	} catch (error) {
		console.error("[CinetPay Webhook]", error);
		// An unknown transaction id will never resolve on retry; anything else might (e.g. a
		// transient failure reaching CinetPay's verify endpoint), so let CinetPay retry those.
		const code = typeof error === "object" && error && "code" in error ? (error as { code?: unknown }).code : undefined;
		return new Response(null, { status: code === "NOT_FOUND" ? 200 : 500 });
	}
}
