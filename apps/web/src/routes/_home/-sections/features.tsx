import type { Icon } from "@phosphor-icons/react";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { EnvelopeSimpleIcon, FilePdfIcon, FilesIcon, PaletteIcon, TranslateIcon } from "@phosphor-icons/react";
import { m } from "motion/react";

type Feature = {
	id: string;
	icon: Icon;
	title: string;
	description: string;
};

// Kept deliberately short: only capabilities that work today with zero extra setup
// (no AI provider, no passkey/HTTPS domain, no storage config) make this list.
const getFeatures = (): Feature[] => [
	{
		id: "instant-generation",
		icon: FilePdfIcon,
		title: t`Instant PDF Export`,
		description: t`Export your resume to PDF instantly, with pixel-perfect formatting.`,
	},
	{
		id: "design",
		icon: PaletteIcon,
		title: t`Full Customization`,
		description: t`Personalize colors, fonts, and layout to make every resume your own.`,
	},
	{
		id: "multiple-resumes",
		icon: FilesIcon,
		title: t`Multiple Resumes`,
		description: t`Create resumes tailored to every role you apply for — free to start, unlimited on Pro.`,
	},
	{
		id: "cover-letters",
		icon: EnvelopeSimpleIcon,
		title: t`Cover Letters`,
		description: t`Write standalone cover letters with the same templates, styling, and export options as your resumes.`,
	},
	{
		id: "languages",
		icon: TranslateIcon,
		title: t`Multilingual`,
		description: t`Available in multiple languages, with more on the way.`,
	},
];

function FeatureRow({ icon: Icon, title, description }: Feature) {
	return (
		<m.div
			className="group flex items-start gap-4 py-5"
			initial={{ opacity: 0, y: 12 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.3 }}
			transition={{ duration: 0.3, ease: "easeOut" }}
		>
			<div
				aria-hidden="true"
				className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/5 text-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary"
			>
				<Icon size={20} weight="thin" />
			</div>

			<div className="flex flex-col gap-y-1 pt-1">
				<h3 className="font-semibold text-base tracking-tight">{title}</h3>
				<p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
			</div>
		</m.div>
	);
}

export function Features() {
	const features = getFeatures();

	return (
		<section id="features" className="p-4 md:p-8 xl:py-16">
			<m.div
				className="max-w-2xl space-y-4"
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.45 }}
			>
				<h2 className="font-semibold text-2xl tracking-tight md:text-4xl xl:text-5xl">
					<Trans>Features</Trans>
				</h2>

				<p className="text-muted-foreground leading-relaxed">
					<Trans>
						Everything you need to create, customize, and share professional resumes and cover letters, built with
						privacy in mind.
					</Trans>
				</p>
			</m.div>

			<div className="mt-8 grid grid-cols-1 gap-x-10 divide-y md:grid-cols-2 md:gap-x-14 md:divide-y-0">
				{features.map((feature) => (
					<FeatureRow key={feature.id} {...feature} />
				))}
			</div>
		</section>
	);
}
