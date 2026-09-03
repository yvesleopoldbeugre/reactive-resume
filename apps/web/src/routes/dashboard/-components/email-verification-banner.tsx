import type { AuthSession } from "@reactive-resume/auth/types";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { WarningIcon } from "@phosphor-icons/react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@reactive-resume/ui/components/alert";
import { Button } from "@reactive-resume/ui/components/button";
import { authClient } from "@/libs/auth/client";
import { getReadableErrorMessage } from "@/libs/error-message";

type EmailVerificationBannerProps = {
	session: AuthSession;
	smtpEnabled: boolean;
};

/**
 * Shown on every `/dashboard/*` page while the signed-in account's email is unverified. Unverified
 * accounts can still browse everything (see `verifiedProcedure` in the API layer), but every
 * create/edit/delete action is blocked server-side -- this banner is the one place that explains
 * why and offers the fix, so a blocked action elsewhere doesn't just look like a broken button.
 */
export function EmailVerificationBanner({ session, smtpEnabled }: EmailVerificationBannerProps) {
	const router = useRouter();

	if (session.user.emailVerified) return null;

	const handleResend = async () => {
		const toastId = toast.loading(t`Resending verification email...`);

		const { error } = await authClient.sendVerificationEmail({
			email: session.user.email,
			callbackURL: "/dashboard/settings/profile",
		});

		if (error) {
			toast.error(
				getReadableErrorMessage(
					error,
					t({
						comment: "Fallback toast when resending account verification email fails",
						message: "Failed to resend verification email. Please try again.",
					}),
				),
				{ id: toastId },
			);
			return;
		}

		toast.success(
			t`A new verification link has been sent to your email address. Please check your inbox to verify your account.`,
			{ id: toastId },
		);
		void router.invalidate();
	};

	return (
		<Alert className="mb-4">
			<WarningIcon />
			<AlertTitle>
				<Trans>Please verify your email address</Trans>
			</AlertTitle>
			<AlertDescription className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
				<span>
					{smtpEnabled ? (
						<Trans>
							You can browse your CVs and cover letters, but creating, editing, or deleting anything is disabled until
							you verify your email.
						</Trans>
					) : (
						<Trans>
							You can browse your CVs and cover letters, but creating, editing, or deleting anything requires a verified
							email -- and email delivery isn't configured on this instance yet.
						</Trans>
					)}
				</span>
				{smtpEnabled && (
					<Button variant="outline" size="sm" onClick={handleResend}>
						<Trans>Resend verification email</Trans>
					</Button>
				)}
			</AlertDescription>
		</Alert>
	);
}
