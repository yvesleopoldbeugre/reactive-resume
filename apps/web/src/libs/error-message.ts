import { t } from "@lingui/core/macro";
import { ORPCError } from "@orpc/client";

export function getReadableErrorMessage(error: unknown, fallback: string): string {
	if (typeof error === "string" && error) return error;
	if (error instanceof Error && error.message) return error.message;
	return fallback;
}

type ErrorMessageByCode = Record<string, string>;

// Applies to every `getOrpcErrorMessage` caller regardless of feature -- unverified accounts can
// hit this on essentially any create/edit/delete action across the app (see `verifiedProcedure`).
// Built fresh on every call (not a module-level constant) so each message reflects whichever
// locale is active at the moment the error is shown, not whichever was active at module load.
function getCommonErrorMessages(): ErrorMessageByCode {
	return {
		EMAIL_NOT_VERIFIED: t`Please verify your email address before making changes.`,
	};
}

export function getOrpcErrorMessage(
	error: unknown,
	options: {
		fallback: string;
		byCode?: ErrorMessageByCode;
		allowServerMessage?: boolean;
	},
): string {
	if (!(error instanceof ORPCError)) return getReadableErrorMessage(error, options.fallback);

	const mappedMessage = options.byCode?.[error.code] ?? getCommonErrorMessages()[error.code];
	if (mappedMessage) return mappedMessage;

	if (options.allowServerMessage && error.message) return error.message;
	return options.fallback;
}

/** Whether an oRPC error means the action was blocked because the caller's email isn't verified yet. */
export function isEmailNotVerifiedError(error: unknown): boolean {
	return error instanceof ORPCError && error.code === "EMAIL_NOT_VERIFIED";
}

export function getResumeErrorMessage(error: unknown): string {
	return getOrpcErrorMessage(error, {
		byCode: {
			RESUME_SLUG_ALREADY_EXISTS: t`A resume with this slug already exists.`,
			RESUME_LOCKED: t`This resume is locked. Unlock it first to make changes.`,
			DOCUMENT_QUOTA_EXCEEDED: t`You've reached your plan's document limit. Upgrade to create more.`,
			TEMPLATE_LOCKED: t`This template isn't included in your plan. Upgrade to unlock it.`,
		},
		fallback: t`Something went wrong. Please try again.`,
	});
}

/** Whether an oRPC error means the action was blocked by the caller's subscription plan. */
export function isBillingRestrictedError(error: unknown): boolean {
	return error instanceof ORPCError && (error.code === "DOCUMENT_QUOTA_EXCEEDED" || error.code === "TEMPLATE_LOCKED");
}

export function getTemplatePresetErrorMessage(error: unknown): string {
	return getOrpcErrorMessage(error, {
		byCode: {
			TEMPLATE_PRESET_SLUG_ALREADY_EXISTS: t`A template preset with this slug already exists.`,
			TEMPLATE_PRESET_KIND_MISMATCH: t`This base template isn't built for that document kind.`,
		},
		fallback: t`Something went wrong. Please try again.`,
	});
}
