import type { Locale } from "@reactive-resume/utils/locale";
import type { User } from "better-auth";
import { ORPCError, os } from "@orpc/server";
import { eq } from "drizzle-orm";
import { auth, verifyOAuthToken } from "@reactive-resume/auth/config";
import { db } from "@reactive-resume/db/client";
import { user } from "@reactive-resume/db/schema";

interface ORPCContext {
	locale: Locale;
	reqHeaders: Headers;
	resHeaders?: Headers;
}

async function getUserFromBearerToken(headers: Headers): Promise<User | null> {
	try {
		const authHeader = headers.get("authorization");
		if (!authHeader?.startsWith("Bearer ")) return null;

		const payload = await verifyOAuthToken(authHeader.slice(7));
		if (!payload?.sub) return null;

		const [userResult] = await db.select().from(user).where(eq(user.id, payload.sub)).limit(1);
		return userResult ?? null;
	} catch (error) {
		console.warn("Bearer token verification failed:", error);
		return null;
	}
}

async function getUserFromHeaders(headers: Headers): Promise<User | null> {
	try {
		const result = await auth.api.getSession({ headers });
		if (!result?.user) return null;

		return result.user;
	} catch (error) {
		console.warn("Session verification failed:", error);
		return null;
	}
}

async function getUserFromApiKey(apiKey: string): Promise<User | null> {
	try {
		const result = await auth.api.verifyApiKey({ body: { key: apiKey } });
		if (!result.key || !result.valid) return null;

		const [userResult] = await db.select().from(user).where(eq(user.id, result.key.referenceId)).limit(1);
		if (!userResult) return null;

		return userResult;
	} catch (error) {
		console.warn("API key verification failed:", error);
		return null;
	}
}

/**
 * Resolve the authenticated user from the same headers oRPC uses (`x-api-key`,
 * `Authorization: Bearer`, or session cookies). Tries each auth method in
 * priority order and returns the first valid identity. Used directly by
 * oRPC's `publicProcedure` and by callers outside oRPC handlers (e.g. MCP
 * tools) where `context.user` is not in scope.
 */
export async function resolveUserFromRequestHeaders(headers: Headers): Promise<User | null> {
	const apiKey = headers.get("x-api-key");
	if (apiKey) {
		const apiKeyUser = await getUserFromApiKey(apiKey);
		if (apiKeyUser) return apiKeyUser;
	} else {
		const bearerUser = await getUserFromBearerToken(headers);
		if (bearerUser) return bearerUser;
	}

	return getUserFromHeaders(headers);
}

const base = os.$context<ORPCContext>();

export const publicProcedure = base.use(async ({ context, next }) => {
	const user = await resolveUserFromRequestHeaders(context.reqHeaders);

	return next({
		context: {
			...context,
			user,
		},
	});
});

export const protectedProcedure = publicProcedure.use(async ({ context, next }) => {
	if (!context.user) throw new ORPCError("UNAUTHORIZED");

	return next({
		context: {
			...context,
			user: context.user,
		},
	});
});

/**
 * `User` (better-auth's base type) doesn't declare `role`, even though the admin plugin adds a
 * real `role` column/session field at runtime -- widening it here to the admin plugin's session
 * shape would cascade type mismatches through every session-resolution path in this file, since
 * `auth.api.getSession()`'s inferred type doesn't line up 1:1 with the plugin's standalone
 * `UserWithRole` type (nullable vs. optional fields differ). Reading `.role` off the same object
 * with a narrow local type is simpler and confines the gap to the one place that needs it.
 */
export const adminProcedure = protectedProcedure.use(async ({ context, next }) => {
	const role = (context.user as { role?: string | null }).role;
	if (role !== "admin") throw new ORPCError("FORBIDDEN");

	return next({ context });
});

/**
 * Gate for anything that creates, edits, or deletes data (as opposed to just reading it). An
 * unverified account keeps full read access -- they can sign in and see their existing CVs/cover
 * letters -- but can't create, edit, or delete anything until they verify their email, to keep
 * spam/throwaway accounts from being usable. Profile management (name/email/username, resending
 * the verification email) goes through Better Auth's own endpoints, not this oRPC layer, so it's
 * never affected by this gate.
 */
export const verifiedProcedure = protectedProcedure.use(async ({ context, next }) => {
	if (!context.user.emailVerified) {
		throw new ORPCError("EMAIL_NOT_VERIFIED", {
			status: 403,
			message: "Please verify your email address before making changes.",
		});
	}

	return next({ context });
});
