import type { ResumeData } from "@reactive-resume/schema/resume/data";
import type { Template } from "@reactive-resume/schema/templates";
import type { TemplateMetadata } from "@/dialogs/resume/template/data";
import { Trans } from "@lingui/react/macro";
import { LockSimpleIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Badge } from "@reactive-resume/ui/components/badge";
import { cn } from "@reactive-resume/utils/style";
import { CometCard } from "@/components/animation/comet-card";

// Lazy so the browser PDF pipeline (pdf.js) loads only when a template grid is shown.
// All visible tiles share the same lazy chunk; only one PDF renders at a time via the shared serial queue.
const TemplateLivePreview = lazy(() =>
	import("@/features/resume/preview/template-live-preview").then((module) => ({
		default: module.TemplateLivePreview,
	})),
);

type TemplateCardProps<TId extends string = Template> = {
	id: TId;
	/** Which built-in template component actually renders the preview (may differ from `id`, e.g. a preset's id). */
	template: Template;
	data: ResumeData;
	isActive?: boolean;
	/** Not included in the caller's plan — the tile dims, shows a lock badge, and clicking goes to Billing instead of selecting. */
	locked?: boolean;
	metadata: TemplateMetadata;
	onSelect: (id: TId) => void;
};

export function TemplateCard<TId extends string = Template>({
	id,
	template,
	data,
	metadata,
	isActive,
	locked,
	onSelect,
}: TemplateCardProps<TId>) {
	const tileClassName = cn(
		"relative block aspect-page size-full cursor-pointer overflow-hidden rounded-md bg-popover outline-none",
		isActive && "ring-2 ring-ring ring-offset-4 ring-offset-background",
		locked && "opacity-60",
	);

	// "custom" (the from-scratch skin engine) has no fixed look of its own -- rendering it with
	// sample data would show one arbitrary skin combination as if it were "the" custom template,
	// which is misleading. Always blank, never live-rendered.
	const preview =
		template === "custom" ? (
			<div className="size-full bg-white" />
		) : (
			// Blank instead of the static (fake sample data) template image while the preview module itself
			// is still loading -- matches TemplateLivePreview's own loading treatment once it mounts.
			<Suspense fallback={<div className="size-full bg-white" />}>
				<TemplateLivePreview data={data} template={template} fallbackSrc={metadata.imageUrl} alt={metadata.name} />
			</Suspense>
		);

	return (
		<CometCard translateDepth={3} rotateDepth={6} glareOpacity={0}>
			{locked ? (
				<Link to="/dashboard/settings/billing" aria-label={metadata.name} className={tileClassName}>
					{preview}
					<div className="absolute inset-0 flex items-center justify-center bg-background/40">
						<Badge className="gap-1">
							<LockSimpleIcon size={12} />
							<Trans>Upgrade to unlock</Trans>
						</Badge>
					</div>
				</Link>
			) : (
				<button type="button" aria-label={metadata.name} onClick={() => onSelect(id)} className={tileClassName}>
					{preview}
				</button>
			)}

			<div className="mt-1 flex items-center justify-center">
				<span className="font-bold leading-loose tracking-tight">{metadata.name}</span>
			</div>

			{metadata.tags.length > 0 && (
				<div className="flex flex-wrap justify-center gap-1 px-1 pb-1">
					{metadata.tags
						.sort((a, b) => a.localeCompare(b))
						.map((tag) => (
							<Badge key={tag} variant="secondary" className="text-xs">
								{tag}
							</Badge>
						))}
				</div>
			)}
		</CometCard>
	);
}
