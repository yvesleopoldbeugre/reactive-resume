import type { PlanId } from "@reactive-resume/schema/billing/plans";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { CheckCircleIcon, CreditCardIcon, InfinityIcon, SparkleIcon } from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { m } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@reactive-resume/ui/components/badge";
import { Button } from "@reactive-resume/ui/components/button";
import { Separator } from "@reactive-resume/ui/components/separator";
import { cn } from "@reactive-resume/utils/style";
import { templates } from "@/dialogs/resume/template/data";
import { formatXof } from "@/libs/currency";
import { getReadableErrorMessage } from "@/libs/error-message";
import { orpc } from "@/libs/orpc/client";

export function BillingSettingsPage() {
	const [checkingOutPlanId, setCheckingOutPlanId] = useState<PlanId | null>(null);

	const { data: subscription } = useQuery(orpc.billing.getMySubscription.queryOptions());
	const { data: plans = [] } = useQuery(orpc.billing.listPlans.queryOptions());

	const { mutate: createCheckout } = useMutation(orpc.billing.createCheckout.mutationOptions());

	function onUpgrade(planId: PlanId) {
		setCheckingOutPlanId(planId);

		createCheckout(
			{ planId },
			{
				onSuccess: ({ paymentUrl }) => {
					window.location.href = paymentUrl;
				},
				onError: (error) => {
					setCheckingOutPlanId(null);
					toast.error(getReadableErrorMessage(error, t`Failed to start checkout. Please try again.`));
				},
			},
		);
	}

	const currentPlan = subscription?.plan;
	const documentsUsed = subscription?.documentCount ?? 0;
	const documentLimit = currentPlan?.documentLimit ?? null;
	const usageRatio = documentLimit ? Math.min(1, documentsUsed / documentLimit) : 0;

	return (
		<m.div
			initial={{ y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25, ease: "easeOut" }}
			className="grid max-w-3xl gap-6 will-change-[transform,opacity]"
		>
			<div className="flex items-start gap-4 rounded-md border bg-popover p-6">
				<div className="rounded-md bg-primary/10 p-2.5">
					<CreditCardIcon className="text-primary" size={24} />
				</div>

				<div className="flex-1 space-y-3">
					<div className="flex items-center gap-2">
						<h3 className="font-semibold">{currentPlan?.name ?? t`Loading…`}</h3>
						{currentPlan && (
							<Badge variant="secondary">
								<Trans>Current plan</Trans>
							</Badge>
						)}
					</div>

					{documentLimit === null ? (
						<p className="flex items-center gap-1.5 text-muted-foreground text-sm">
							<InfinityIcon size={16} />
							<Trans>Unlimited CVs and cover letters</Trans>
						</p>
					) : (
						<div className="space-y-1.5">
							<p className="text-muted-foreground text-sm">
								<Trans>
									{documentsUsed} of {documentLimit} documents used
								</Trans>
							</p>
							<div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
								<div
									className={cn("h-full rounded-full", usageRatio >= 1 ? "bg-destructive" : "bg-primary")}
									style={{ width: `${usageRatio * 100}%` }}
								/>
							</div>
						</div>
					)}

					{subscription?.currentPeriodEnd && (
						<p className="text-muted-foreground text-xs">
							<Trans>Renews on {subscription.currentPeriodEnd.toLocaleDateString()}</Trans>
						</p>
					)}
				</div>
			</div>

			<Separator />

			<div className="grid gap-4 sm:grid-cols-3">
				{plans.map((plan) => {
					const isCurrent = plan.id === currentPlan?.id;
					const isFree = plan.priceXof === 0;
					const visibleTemplates = plan.allowedTemplates.filter((template) => template !== "custom");

					return (
						<div
							key={plan.id}
							className={cn(
								"flex flex-col gap-4 rounded-md border bg-popover p-5",
								isCurrent && "border-primary ring-1 ring-primary",
							)}
						>
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<h4 className="font-semibold">{plan.name}</h4>
									{isCurrent && (
										<Badge variant="secondary" className="text-xs">
											<Trans>Current</Trans>
										</Badge>
									)}
								</div>
								<p className="font-bold text-2xl">
									{isFree ? t`Free` : formatXof(plan.priceXof)}
									{plan.billingPeriod && (
										<span className="font-normal text-muted-foreground text-sm">
											{plan.billingPeriod === "monthly" ? t` / month` : t` / year`}
										</span>
									)}
								</p>
							</div>

							<ul className="flex-1 space-y-2 text-sm">
								<li className="flex items-center gap-2">
									<CheckCircleIcon className="shrink-0 text-primary" size={16} />
									{plan.documentLimit === null ? (
										<Trans>Unlimited documents</Trans>
									) : (
										<Trans>Up to {plan.documentLimit} documents</Trans>
									)}
								</li>
								<li className="flex items-center gap-2">
									<CheckCircleIcon className="shrink-0 text-primary" size={16} />
									<Trans>{visibleTemplates.length} templates unlocked</Trans>
								</li>
							</ul>

							<div className="flex flex-wrap gap-1">
								{/* "custom" is the from-scratch skin-engine option, not an actual template design --
								    excluded here so this chip list only previews real templates (matches the
								    template picker's own convention). */}
								{visibleTemplates.slice(0, 6).map((template) => (
									<Badge key={template} variant="outline" className="text-xs">
										{templates[template].name}
									</Badge>
								))}
								{visibleTemplates.length > 6 && (
									<Badge variant="outline" className="text-xs">
										+{visibleTemplates.length - 6}
									</Badge>
								)}
							</div>

							{!isFree && (
								<Button
									variant={isCurrent ? "outline" : "default"}
									disabled={isCurrent || checkingOutPlanId !== null}
									onClick={() => onUpgrade(plan.id)}
								>
									<SparkleIcon />
									{checkingOutPlanId === plan.id ? t`Redirecting…` : isCurrent ? t`Current plan` : t`Upgrade`}
								</Button>
							)}
						</div>
					);
				})}
			</div>
		</m.div>
	);
}
