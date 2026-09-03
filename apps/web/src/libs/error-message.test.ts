import { beforeAll, describe, expect, it } from "vitest";
import { i18n } from "@lingui/core";
import { ORPCError } from "@orpc/client";
import {
	getOrpcErrorMessage,
	getReadableErrorMessage,
	getResumeErrorMessage,
	isBillingRestrictedError,
	isEmailNotVerifiedError,
} from "./error-message";

// The byCode/fallback messages below go through Lingui's `t` macro (so they're translated in the
// real app) -- it needs a locale activated, even an empty one, or it throws instead of falling
// back to the source text.
beforeAll(() => {
	i18n.loadAndActivate({ locale: "en", messages: {} });
});

describe("getReadableErrorMessage", () => {
	it("returns the string error directly", () => {
		expect(getReadableErrorMessage("explicit error", "fallback")).toBe("explicit error");
	});

	it("returns Error.message", () => {
		expect(getReadableErrorMessage(new Error("boom"), "fallback")).toBe("boom");
	});

	it("returns fallback for unknown shapes", () => {
		expect(getReadableErrorMessage({ random: "object" }, "fallback")).toBe("fallback");
		expect(getReadableErrorMessage(null, "fallback")).toBe("fallback");
		expect(getReadableErrorMessage(undefined, "fallback")).toBe("fallback");
		expect(getReadableErrorMessage(42, "fallback")).toBe("fallback");
	});

	it("returns fallback for empty string error (falsy)", () => {
		expect(getReadableErrorMessage("", "fallback")).toBe("fallback");
	});

	it("returns fallback for Error with empty message", () => {
		expect(getReadableErrorMessage(new Error(""), "fallback")).toBe("fallback");
	});
});

describe("getOrpcErrorMessage", () => {
	it("delegates to getReadableErrorMessage for non-ORPCErrors", () => {
		expect(getOrpcErrorMessage(new Error("boom"), { fallback: "fallback" })).toBe("boom");
		expect(getOrpcErrorMessage("string error", { fallback: "fallback" })).toBe("string error");
	});

	it("uses byCode mapping when present", () => {
		const error = new ORPCError("RESUME_LOCKED");
		expect(
			getOrpcErrorMessage(error, {
				fallback: "fallback",
				byCode: { RESUME_LOCKED: "It is locked." },
			}),
		).toBe("It is locked.");
	});

	it("returns server message when allowServerMessage and message is set", () => {
		const error = new ORPCError("OTHER", { message: "Server-provided message" });
		expect(
			getOrpcErrorMessage(error, {
				fallback: "fallback",
				allowServerMessage: true,
			}),
		).toBe("Server-provided message");
	});

	it("falls back when allowServerMessage is false even if message set", () => {
		const error = new ORPCError("OTHER", { message: "Server-provided message" });
		expect(getOrpcErrorMessage(error, { fallback: "fallback" })).toBe("fallback");
	});

	it("byCode takes precedence over allowServerMessage", () => {
		const error = new ORPCError("RESUME_LOCKED", { message: "Server msg" });
		expect(
			getOrpcErrorMessage(error, {
				fallback: "fallback",
				byCode: { RESUME_LOCKED: "It is locked." },
				allowServerMessage: true,
			}),
		).toBe("It is locked.");
	});

	it("returns fallback when no mapping or server message", () => {
		const error = new ORPCError("UNKNOWN_CODE");
		expect(getOrpcErrorMessage(error, { fallback: "fallback" })).toBe("fallback");
	});

	it("maps EMAIL_NOT_VERIFIED for every caller, even without an explicit byCode entry", () => {
		const error = new ORPCError("EMAIL_NOT_VERIFIED");
		expect(getOrpcErrorMessage(error, { fallback: "fallback" })).toBe(
			"Please verify your email address before making changes.",
		);
	});

	it("lets a caller's own byCode override the common EMAIL_NOT_VERIFIED message", () => {
		const error = new ORPCError("EMAIL_NOT_VERIFIED");
		expect(
			getOrpcErrorMessage(error, {
				fallback: "fallback",
				byCode: { EMAIL_NOT_VERIFIED: "Custom override." },
			}),
		).toBe("Custom override.");
	});
});

describe("getResumeErrorMessage", () => {
	it("returns mapped message for RESUME_SLUG_ALREADY_EXISTS", () => {
		const error = new ORPCError("RESUME_SLUG_ALREADY_EXISTS");
		expect(getResumeErrorMessage(error)).toBe("A resume with this slug already exists.");
	});

	it("returns mapped message for RESUME_LOCKED", () => {
		const error = new ORPCError("RESUME_LOCKED");
		expect(getResumeErrorMessage(error)).toBe("This resume is locked. Unlock it first to make changes.");
	});

	it("returns generic fallback for unknown codes", () => {
		const error = new ORPCError("UNKNOWN");
		expect(getResumeErrorMessage(error)).toBe("Something went wrong. Please try again.");
	});

	it("returns fallback for plain Error (delegates to getOrpcErrorMessage)", () => {
		// Plain Error gets readable message
		expect(getResumeErrorMessage(new Error("boom"))).toBe("boom");
	});

	it("returns fallback for unknown shape", () => {
		expect(getResumeErrorMessage(null)).toBe("Something went wrong. Please try again.");
	});

	it("returns mapped message for DOCUMENT_QUOTA_EXCEEDED", () => {
		const error = new ORPCError("DOCUMENT_QUOTA_EXCEEDED");
		expect(getResumeErrorMessage(error)).toBe("You've reached your plan's document limit. Upgrade to create more.");
	});

	it("returns mapped message for TEMPLATE_LOCKED", () => {
		const error = new ORPCError("TEMPLATE_LOCKED");
		expect(getResumeErrorMessage(error)).toBe("This template isn't included in your plan. Upgrade to unlock it.");
	});
});

describe("isBillingRestrictedError", () => {
	it("is true for DOCUMENT_QUOTA_EXCEEDED and TEMPLATE_LOCKED", () => {
		expect(isBillingRestrictedError(new ORPCError("DOCUMENT_QUOTA_EXCEEDED"))).toBe(true);
		expect(isBillingRestrictedError(new ORPCError("TEMPLATE_LOCKED"))).toBe(true);
	});

	it("is false for other ORPCErrors and non-ORPCErrors", () => {
		expect(isBillingRestrictedError(new ORPCError("RESUME_LOCKED"))).toBe(false);
		expect(isBillingRestrictedError(new Error("boom"))).toBe(false);
		expect(isBillingRestrictedError(null)).toBe(false);
	});
});

describe("isEmailNotVerifiedError", () => {
	it("is true for EMAIL_NOT_VERIFIED", () => {
		expect(isEmailNotVerifiedError(new ORPCError("EMAIL_NOT_VERIFIED"))).toBe(true);
	});

	it("is false for other ORPCErrors and non-ORPCErrors", () => {
		expect(isEmailNotVerifiedError(new ORPCError("RESUME_LOCKED"))).toBe(false);
		expect(isEmailNotVerifiedError(new Error("boom"))).toBe(false);
		expect(isEmailNotVerifiedError(null)).toBe(false);
	});
});
