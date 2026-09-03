import type { Plan, PlanId } from "@reactive-resume/schema/billing/plans";
import type { Template } from "@reactive-resume/schema/templates";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { CheckCircleIcon, CreditCardIcon, FloppyDiskIcon, InfinityIcon, SparkleIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { templateKindMap } from "@reactive-resume/schema/templates";
import { Badge } from "@reactive-resume/ui/components/badge";
import { Button } from "@reactive-resume/ui/components/button";
import { Checkbox } from "@reactive-resume/ui/components/checkbox";
import { Input } from "@reactive-resume/ui/components/input";
import { Label } from "@reactive-resume/ui/components/label";
import { Separator } from "@reactive-resume/ui/components/separator";
import { cn } from "@reactive-resume/utils/style";
import { templates } from "@/dialogs/resume/template/data";
import { authClient } from "@/libs/auth/client";
import { formatXof } from "@/libs/currency";
import { getReadableErrorMessage } from "@/libs/error-message";
import { orpc } from "@/libs/orpc/client";

const RESUME_TEMPLATES = (Object.keys(templateKindMap) as Template[]).filter(
	(template) => templateKindMap[template] === "resume",
);
const COVER_LETTER_TEMPLATES = (Object.keys(templateKindMap) as Template[]).filter(
	(template) => templateKindMap[template] === "cover-letter",
);

export function BillingSettingsPage() {
	const { data: session } = authClient.useSession();

	// Admins configure the plan catalog itself instead of subscribing to it -- everyone else sees
	// the normal subscriber-facing view below.
	if (session?.user.role === "admin") return <AdminPlanConfigPage />;

	return <SubscriberBillingPage />;
}

function AdminPlanConfigPage() {
	const { data: plans = [] } = useQuery(orpc.billing.listPlans.queryOptions());

	return (
		<m.div
			initial={{ y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25, ease: "easeOut" }}
			className="grid max-w-3xl gap-6 will-change-[transform,opacity]"
		>
			<p className="text-muted-foreground text-sm">
				<Trans>
					Configure the price, document quota, and unlocked templates for each subscription plan. Changes take effect
					immediately for every account on that plan.
				</Trans>
			</p>

			<div className="grid gap-6">
				{plans.map((plan) => (
					<PlanEditorCard key={plan.id} plan={plan} />
				))}
			</div>
		</m.div>
	);
}

type PlanEditorCardProps = {
	plan: Plan;
};

function PlanEditorCard({ plan }: PlanEditorCardProps) {
	const queryClient = useQueryClient();

	const [name, setName] = useState(plan.name);
	const [priceXof, setPriceXof] = useState(plan.priceXof);
	const [unlimited, setUnlimited] = useState(plan.documentLimit === null);
	const [documentLimit, setDocumentLimit] = useState(plan.documentLimit ?? 3);
	const [allowedTemplates, setAllowedTemplates] = useState<Set<Template>>(new Set(plan.allowedTemplates));

	// Re-seed the editor whenever this plan's server data (re)loads -- e.g. after this card's own
	// save invalidates the list, or another admin's edit lands in a refetch.
	useEffect(() => {
		setName(plan.name);
		setPriceXof(plan.priceXof);
		setUnlimited(plan.documentLimit === null);
		setDocumentLimit(plan.documentLimit ?? 3);
		setAllowedTemplates(new Set(plan.allowedTemplates));
	}, [plan]);

	const { mutate: updatePlan, isPending } = useMutation(
		orpc.billing.updatePlan.mutationOptions({
			onSuccess: () => {
				toast.success(t`Plan updated.`);
				void queryClient.invalidateQueries({ queryKey: orpc.billing.listPlans.queryKey() });
			},
			onError: (error) => toast.error(getReadableErrorMessage(error, t`Failed to update the plan.`)),
		}),
	);

	function toggleTemplate(template: Template, checked: boolean) {
		setAllowedTemplates((previous) => {
			const next = new Set(previous);
			if (checked) next.add(template);
			else next.delete(template);
			return next;
		});
	}

	function onSave() {
		updatePlan({
			id: plan.id,
			name: name.trim(),
			priceXof,
			documentLimit: unlimited ? null : documentLimit,
			allowedTemplates: [...allowedTemplates],
		});
	}

	return (
		<div className="space-y-5 rounded-md border bg-popover p-5">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<h4 className="font-semibold">{plan.name}</h4>
					{plan.billingPeriod && (
						<Badge variant="outline" className="text-xs">
							{plan.billingPeriod === "monthly" ? t`Monthly` : t`Yearly`}
						</Badge>
					)}
				</div>
				<Button size="sm" onClick={onSave} disabled={isPending}>
					<FloppyDiskIcon />
					{isPending ? (
						<Trans>Saving…</Trans>
					) : (
						<Trans context="Save an edited subscription plan in the admin billing config page">Save</Trans>
					)}
				</Button>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-1.5">
					<Label htmlFor={`plan-name-${plan.id}`}>
						<Trans>Name</Trans>
					</Label>
					<Input id={`plan-name-${plan.id}`} value={name} onChange={(event) => setName(event.target.value)} />
				</div>

				<div className="space-y-1.5">
					<Label htmlFor={`plan-price-${plan.id}`}>
						<Trans>Price (FCFA)</Trans>
					</Label>
					<Input
						id={`plan-price-${plan.id}`}
						type="number"
						min={0}
						value={priceXof}
						onChange={(event) => setPriceXof(Math.max(0, Number(event.target.value)))}
					/>
				</div>
			</div>

			<div className="space-y-1.5">
				<Label htmlFor={`plan-limit-${plan.id}`}>
					<Trans>Document quota</Trans>
				</Label>
				<div className="flex items-center gap-3">
					<Input
						id={`plan-limit-${plan.id}`}
						type="number"
						min={0}
						disabled={unlimited}
						value={documentLimit}
						onChange={(event) => setDocumentLimit(Math.max(0, Number(event.target.value)))}
						className="max-w-32"
					/>
					<div className="flex items-center gap-2 text-sm">
						<Checkbox id={`plan-unlimited-${plan.id}`} checked={unlimited} onCheckedChange={setUnlimited} />
						<Label htmlFor={`plan-unlimited-${plan.id}`}>
							<Trans>Unlimited</Trans>
						</Label>
					</div>
				</div>
			</div>

			<div className="space-y-2">
				<Label>
					<Trans>Unlocked resume templates</Trans>
				</Label>
				<div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
					{RESUME_TEMPLATES.map((template) => (
						<div key={template} className="flex items-center gap-2 text-sm">
							<Checkbox
								id={`plan-${plan.id}-template-${template}`}
								checked={allowedTemplates.has(template)}
								onCheckedChange={(checked) => toggleTemplate(template, checked)}
							/>
							<Label htmlFor={`plan-${plan.id}-template-${template}`}>{templates[template].name}</Label>
						</div>
					))}
				</div>
			</div>

			<div className="space-y-2">
				<Label>
					<Trans>Unlocked cover letter templates</Trans>
				</Label>
				<div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
					{COVER_LETTER_TEMPLATES.map((template) => (
						<div key={template} className="flex items-center gap-2 text-sm">
							<Checkbox
								id={`plan-${plan.id}-template-${template}`}
								checked={allowedTemplates.has(template)}
								onCheckedChange={(checked) => toggleTemplate(template, checked)}
							/>
							<Label htmlFor={`plan-${plan.id}-template-${template}`}>{templates[template].name}</Label>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function SubscriberBillingPage() {
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
