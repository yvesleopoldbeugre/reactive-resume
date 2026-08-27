import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { m } from "motion/react";
import { BRAND } from "@reactive-resume/brand";
import { Button } from "@reactive-resume/ui/components/button";
import { CometCard } from "@/components/animation/comet-card";
import { Spotlight } from "@/components/animation/spotlight";

export function Hero() {
	return (
		<section
			id="hero"
			className="relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden border-b py-24"
		>
			<Spotlight />

			<m.div
				className="w-full will-change-[transform,opacity]"
				initial={{ opacity: 0, y: 100 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 1.1, ease: "easeOut" }}
			>
				<div className="relative mx-auto max-w-sm px-8 md:max-w-md md:px-12 lg:px-0">
					{/* Cover letter, fanned out from behind the resume card — same size and same interactive
					    tilt effect as the resume, so it reads as an equal, real second document, not decoration. */}
					<CometCard
						glareOpacity={0.15}
						className="absolute inset-0 z-0 translate-x-[38%] translate-y-10 rotate-6 md:translate-x-[42%]"
					>
						<img
							width={510}
							height={720}
							src="/templates/jpg/cover-letter-sample.jpg"
							alt={t`A sample cover letter built with ${BRAND.name}`}
							className="pointer-events-none aspect-page w-full rounded-md border object-cover shadow-2xl"
						/>
					</CometCard>

					<CometCard glareOpacity={0.15} className="relative z-10 -mb-12 md:-mb-24">
						<img
							width={510}
							height={720}
							src="/templates/jpg/onyx.jpg"
							alt={t`A sample resume built with ${BRAND.name}, using the Onyx template`}
							className="pointer-events-none aspect-page w-full rounded-md border object-cover shadow-2xl"
						/>

						<div
							aria-hidden="true"
							className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-60% via-transparent to-background"
						/>
					</CometCard>
				</div>
			</m.div>

			<div className="relative z-10 flex max-w-2xl flex-col items-center gap-y-6 px-4 xs:px-0 text-center">
				{/* Headline */}
				<m.div
					className="will-change-[transform,opacity]"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.45, delay: 0.7 }}
				>
					<h1 className="font-semibold text-4xl tracking-tight md:text-5xl lg:text-6xl">
						<Trans>A resume & cover letter builder that gets you noticed</Trans>
					</h1>
				</m.div>

				{/* Description */}
				<m.p
					className="max-w-xl text-base text-muted-foreground leading-relaxed will-change-[transform,opacity] md:text-lg"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.45, delay: 0.82 }}
				>
					{t`${BRAND.name} helps you build, customize, and share a professional resume and cover letter in minutes.`}
				</m.p>

				{/* CTA Buttons */}
				<m.div
					className="flex flex-col items-center gap-3 will-change-[transform,opacity] sm:flex-row sm:gap-4"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.45, delay: 0.95 }}
				>
					<Button
						size="lg"
						nativeButton={false}
						className="group relative overflow-hidden px-4"
						render={
							<Link to="/dashboard">
								<span className="relative z-10 flex items-center gap-2">
									<Trans>Get Started</Trans>
									<ArrowRightIcon
										aria-hidden="true"
										className="size-4 transition-transform group-hover:translate-x-0.5"
									/>
								</span>
							</Link>
						}
					/>
				</m.div>
			</div>

			{/* Scroll indicator - decorative */}
			<m.div
				aria-hidden="true"
				role="presentation"
				className="absolute inset-s-1/2 bottom-8 -translate-x-1/2"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1.25, duration: 0.7 }}
			>
				<m.div
					className="flex h-8 w-5 items-start justify-center rounded-full border border-muted-foreground/30 p-1.5 will-change-transform"
					animate={{ y: [0, 5, 0] }}
					transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
				>
					<m.div className="h-1.5 w-1 rounded-full bg-muted-foreground/50" />
				</m.div>
			</m.div>
		</section>
	);
}
