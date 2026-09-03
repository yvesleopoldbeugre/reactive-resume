import * as React from "react";
import {
	Body,
	Button,
	Container,
	Font,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	pixelBasedPreset,
	Section,
	Tailwind,
	Text,
} from "react-email";
import { BRAND } from "@reactive-resume/brand";

// ponytail: server dev consumes this source through tsx, which emits React.createElement here.
void React;

const appName = BRAND.name;
// A PNG, not the site's usual SVG icon -- most email clients (Gmail, Outlook, ...) don't render
// inline SVG images at all, which was silently dropping the logo from every auth email.
const logoUrl = `${BRAND.url}/icon/dark-email.png`;

/**
 * Auth emails only support the languages this deployment's audience actually needs -- not the
 * full ~54-locale catalog the web app has (most of which are still machine-pretranslated). Any
 * locale other than French falls back to English, the source language.
 */
export type EmailLocale = "fr-FR" | "en-US";

export function resolveEmailLocale(locale: string | null | undefined): EmailLocale {
	return locale === "fr-FR" ? "fr-FR" : "en-US";
}

type AuthEmailCopy = {
	resetPassword: {
		subject: string;
		heading: string;
		intro: string;
		details: string;
		actionLabel: string;
		outro: string;
	};
	verifyEmail: {
		subject: string;
		heading: string;
		intro: string;
		details: string;
		actionLabel: string;
		outro: string;
	};
	verifyEmailChange: {
		subject: string;
		heading: string;
		intro: (previousEmail: string, newEmail: string) => string;
		details: string;
		actionLabel: string;
		outro: string;
	};
	linkFallback: string;
};

const COPY: Record<EmailLocale, AuthEmailCopy> = {
	"en-US": {
		resetPassword: {
			subject: `Reset your ${appName} password`,
			heading: "Password Reset",
			intro: `We received a request to reset your ${appName} password.`,
			details: "If this was not you, you can ignore this message and your password will remain unchanged.",
			actionLabel: "Create New Password",
			outro: `For security, only use links from emails sent by ${appName}.`,
		},
		verifyEmail: {
			subject: `Verify your email for ${appName}`,
			heading: "Verify Email",
			intro: `Thanks for signing up for ${appName}. Please verify your email address to continue.`,
			details: "Verification helps us protect your account and keep your sign-in secure.",
			actionLabel: "Verify Email",
			outro: "If you did not create this account, you can safely ignore this email.",
		},
		verifyEmailChange: {
			subject: `Confirm your new ${appName} email address`,
			heading: "Confirm Email Change",
			intro: (previousEmail, newEmail) =>
				`You requested to change your ${appName} email from ${previousEmail} to ${newEmail}.`,
			details: "Confirm this change to complete the update and keep your account access uninterrupted.",
			actionLabel: "Verify New Email",
			outro: "If you did not request this change, ignore this email and secure your account.",
		},
		linkFallback: "If the button does not work, copy and paste this link into your browser:",
	},
	"fr-FR": {
		resetPassword: {
			subject: `Réinitialisez votre mot de passe ${appName}`,
			heading: "Réinitialisation du mot de passe",
			intro: `Nous avons reçu une demande de réinitialisation de votre mot de passe ${appName}.`,
			details: "Si ce n'est pas vous, vous pouvez ignorer ce message : votre mot de passe restera inchangé.",
			actionLabel: "Créer un nouveau mot de passe",
			outro: `Pour votre sécurité, n'utilisez que les liens envoyés par ${appName}.`,
		},
		verifyEmail: {
			subject: `Vérifiez votre adresse e-mail pour ${appName}`,
			heading: "Vérification de l'e-mail",
			intro: `Merci de vous être inscrit(e) sur ${appName}. Veuillez vérifier votre adresse e-mail pour continuer.`,
			details: "La vérification nous aide à protéger votre compte et à sécuriser votre connexion.",
			actionLabel: "Vérifier mon e-mail",
			outro: "Si vous n'êtes pas à l'origine de la création de ce compte, vous pouvez ignorer cet e-mail.",
		},
		verifyEmailChange: {
			subject: `Confirmez votre nouvelle adresse e-mail ${appName}`,
			heading: "Confirmation du changement d'e-mail",
			intro: (previousEmail, newEmail) =>
				`Vous avez demandé à changer votre adresse e-mail ${appName} de ${previousEmail} vers ${newEmail}.`,
			details: "Confirmez ce changement pour finaliser la mise à jour et conserver l'accès à votre compte.",
			actionLabel: "Vérifier ma nouvelle adresse",
			outro: "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail et sécurisez votre compte.",
		},
		linkFallback: "Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :",
	},
};

interface AuthEmailLayoutProps {
	locale: EmailLocale;
	preview: string;
	heading: string;
	intro: string;
	details?: string;
	actionLabel: string;
	actionUrl: string;
	outro: string;
}

function AuthEmailLayout({
	locale,
	preview,
	heading,
	intro,
	details,
	actionLabel,
	actionUrl,
	outro,
}: AuthEmailLayoutProps) {
	const linkFallback = COPY[locale].linkFallback;

	return (
		<Html lang={locale === "fr-FR" ? "fr" : "en"}>
			<Tailwind
				config={{
					presets: [pixelBasedPreset],
					theme: {
						fontFamily: {
							body: ["Poppins", "sans-serif"],
							heading: ["Poppins", "sans-serif"],
						},
					},
				}}
			>
				<Head>
					<Font
						fontFamily="Poppins"
						fallbackFontFamily="sans-serif"
						fontWeight={700}
						fontStyle="normal"
						webFont={{
							url: "https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.woff2",
							format: "woff2",
						}}
					/>
					<Font
						fontFamily="Poppins"
						fallbackFontFamily="sans-serif"
						fontWeight={400}
						fontStyle="normal"
						webFont={{
							url: "https://fonts.gstatic.com/s/poppins/v24/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2",
							format: "woff2",
						}}
					/>
				</Head>

				<Body className="m-0 bg-zinc-950 p-0 font-body text-sm text-zinc-50">
					<Preview>{preview}</Preview>
					<Container className="mx-auto w-full max-w-xl bg-zinc-900 p-6 text-zinc-50">
						<Section>
							<Img src={logoUrl} alt={appName} width="48" height="48" className="block" />
						</Section>

						<Section className="mt-6">
							<Heading className="whitespace-break-spaces font-heading font-medium text-2xl leading-0 tracking-tighter md:text-5xl">
								{heading}
							</Heading>

							<Section className="mt-6 md:mt-12">
								<Text>{intro}</Text>

								{details ? <Text className="opacity-60">{details}</Text> : null}
							</Section>

							<Button
								target="_blank"
								href={actionUrl}
								className="mt-6 box-border inline-block bg-zinc-200 px-6 py-3 text-center text-zinc-900 no-underline"
							>
								{actionLabel}
							</Button>

							<Section className="mt-8">
								<Text className="leading-0">{linkFallback}</Text>
								<Link className="text-zinc-200/60 leading-0 underline underline-offset-2" href={actionUrl}>
									{actionUrl}
								</Link>
							</Section>

							<Section className="mt-4">
								<Text className="opacity-60">{outro}</Text>
							</Section>

							<Hr className="my-10 border-zinc-700" />

							<Text className="mt-8 font-heading font-medium text-base tracking-tight opacity-80">{appName}</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}

interface ResetPasswordEmailProps {
	url: string;
	locale?: EmailLocale;
}

export function getResetPasswordEmailSubject(locale: EmailLocale): string {
	return COPY[locale].resetPassword.subject;
}

export function ResetPasswordEmail({ url, locale = "en-US" }: ResetPasswordEmailProps) {
	const copy = COPY[locale].resetPassword;

	return (
		<AuthEmailLayout
			locale={locale}
			preview={copy.subject}
			heading={copy.heading}
			intro={copy.intro}
			details={copy.details}
			actionLabel={copy.actionLabel}
			actionUrl={url}
			outro={copy.outro}
		/>
	);
}

interface VerifyEmailProps {
	url: string;
	locale?: EmailLocale;
}

export function getVerifyEmailSubject(locale: EmailLocale): string {
	return COPY[locale].verifyEmail.subject;
}

export function VerifyEmail({ url, locale = "en-US" }: VerifyEmailProps) {
	const copy = COPY[locale].verifyEmail;

	return (
		<AuthEmailLayout
			locale={locale}
			preview={copy.subject}
			heading={copy.heading}
			intro={copy.intro}
			details={copy.details}
			actionLabel={copy.actionLabel}
			actionUrl={url}
			outro={copy.outro}
		/>
	);
}

interface VerifyEmailChangeProps {
	url: string;
	previousEmail: string;
	newEmail: string;
	locale?: EmailLocale;
}

export function getVerifyEmailChangeSubject(locale: EmailLocale): string {
	return COPY[locale].verifyEmailChange.subject;
}

export function VerifyEmailChange({ url, previousEmail, newEmail, locale = "en-US" }: VerifyEmailChangeProps) {
	const copy = COPY[locale].verifyEmailChange;

	return (
		<AuthEmailLayout
			locale={locale}
			preview={copy.subject}
			heading={copy.heading}
			intro={copy.intro(previousEmail, newEmail)}
			details={copy.details}
			actionLabel={copy.actionLabel}
			actionUrl={url}
			outro={copy.outro}
		/>
	);
}
