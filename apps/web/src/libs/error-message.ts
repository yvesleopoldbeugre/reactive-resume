import { ORPCError } from "@orpc/client";

export function getReadableErrorMessage(error: unknown, fallback: string): string {
	if (typeof error === "string" && error) return error;
	if (error instanceof Error && error.message) return error.message;
	return fallback;
}

type ErrorMessageByCode = Record<string, string>;

export function getOrpcErrorMessage(
	error: unknown,
	options: {
		fallback: string;
		byCode?: ErrorMessageByCode;
		allowServerMessage?: boolean;
	},
): string {
	if (!(error instanceof ORPCError)) return getReadableErrorMessage(error, options.fallback);

	const mappedMessage = options.byCode?.[error.code];
	if (mappedMessage) return mappedMessage;

	if (options.allowServerMessage && error.message) return error.message;
	return options.fallback;
}

export function getResumeErrorMessage(error: unknown): string {
	return getOrpcErrorMessage(error, {
		byCode: {
			RESUME_SLUG_ALREADY_EXISTS: "A resume with this slug already exists.",
			RESUME_LOCKED: "This resume is locked. Unlock it first to make changes.",
			DOCUMENT_QUOTA_EXCEEDED: "You've reached your plan's document limit. Upgrade to create more.",
			TEMPLATE_LOCKED: "This template isn't included in your plan. Upgrade to unlock it.",
		},
		fallback: "Something went wrong. Please try again.",
	});
}

/** Whether an oRPC error means the action was blocked by the caller's subscription plan. */
export function isBillingRestrictedError(error: unknown): boolean {
	return error instanceof ORPCError && (error.code === "DOCUMENT_QUOTA_EXCEEDED" || error.code === "TEMPLATE_LOCKED");
}

export function getTemplatePresetErrorMessage(error: unknown): string {
	return getOrpcErrorMessage(error, {
		byCode: {
			TEMPLATE_PRESET_SLUG_ALREADY_EXISTS: "A template preset with this slug already exists.",
			TEMPLATE_PRESET_KIND_MISMATCH: "This base template isn't built for that document kind.",
		},
		fallback: "Something went wrong. Please try again.",
	});
}
