import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { CheckCircleIcon, InfinityIcon, SparkleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { m } from "motion/react";
import { Badge } from "@reactive-resume/ui/components/badge";
import { Button } from "@reactive-resume/ui/components/button";
import { cn } from "@reactive-resume/utils/style";
import { formatXof } from "@/libs/currency";
import { orpc } from "@/libs/orpc/client";

export function Pricing() {
	// Public and live: reflects whatever an admin has configured in the billing settings page,
	// rather than a static build-time catalog.
	const { data: plans = [] } = useQuery(orpc.billing.listPlans.queryOptions());

	return (
		<section id="pricing" className="p-4 md:p-8 xl:py-16">
			<m.div
				className="max-w-2xl space-y-4"
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.45 }}
			>
				<h2 className="font-semibold text-2xl tracking-tight md:text-4xl xl:text-5xl">
					<Trans>Pricing</Trans>
				</h2>

				<p className="text-muted-foreground leading-relaxed">
					<Trans>Start for free. Upgrade whenever you need more documents or more templates to choose from.</Trans>
				</p>
			</m.div>

			<div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
				{plans.map((plan, index) => {
					const isFree = plan.priceXof === 0;
					const isHighlighted = plan.billingPeriod === "yearly";
					// "custom" is the from-scratch skin-engine option, not an actual template design --
					// excluded so this count matches what the template picker actually shows as designs.
					const templateCount = plan.allowedTemplates.filter((template) => template !== "custom").length;

					return (
						<m.div
							key={plan.id}
							className={cn(
								"flex flex-col gap-5 rounded-md border bg-popover p-6",
								isHighlighted && "border-primary ring-1 ring-primary",
							)}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.35, delay: index * 0.08 }}
						>
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<h3 className="font-semibold text-lg">{plan.name}</h3>
									{isHighlighted && (
										<Badge className="gap-1">
											<SparkleIcon size={12} />
											<Trans>Best value</Trans>
										</Badge>
									)}
								</div>

								<p className="font-bold text-3xl tracking-tight">
									{isFree ? t`Free` : formatXof(plan.priceXof)}
									{plan.billingPeriod && (
										<span className="font-normal text-base text-muted-foreground">
											{plan.billingPeriod === "monthly" ? t` / month` : t` / year`}
										</span>
									)}
								</p>
							</div>

							<ul className="flex-1 space-y-2.5 text-sm">
								<li className="flex items-center gap-2">
									<CheckCircleIcon className="shrink-0 text-primary" size={18} />
									{plan.documentLimit === null ? (
										<Trans>Unlimited documents</Trans>
									) : (
										<Trans>Up to {plan.documentLimit} documents</Trans>
									)}
								</li>
								<li className="flex items-center gap-2">
									<CheckCircleIcon className="shrink-0 text-primary" size={18} />
									<Trans>{templateCount} templates unlocked</Trans>
								</li>
								{!isFree && (
									<li className="flex items-center gap-2">
										<InfinityIcon className="shrink-0 text-primary" size={18} />
										<Trans>All future templates included</Trans>
									</li>
								)}
							</ul>

							<Button
								variant={isHighlighted ? "default" : "outline"}
								nativeButton={false}
								render={
									<Link to="/dashboard">
										<Trans>Get Started</Trans>
									</Link>
								}
							/>
						</m.div>
					);
				})}
			</div>
		</section>
	);
}
