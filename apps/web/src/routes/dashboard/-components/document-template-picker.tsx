import type { Template } from "@reactive-resume/schema/templates";
import type { Locale } from "@reactive-resume/utils/locale";
import type { TemplateMetadata } from "@/dialogs/resume/template/data";
import { useLingui } from "@lingui/react";
import { SlideshowIcon } from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { buildPlaceholderCoverLetterData } from "@reactive-resume/resume/cover-letter-placeholder";
import { applyPresetConfig } from "@reactive-resume/resume/preset";
import { createSampleResumeData } from "@reactive-resume/schema/resume/sample";
import { ScrollArea } from "@reactive-resume/ui/components/scroll-area";
import { generateId, generateRandomName, slugify } from "@reactive-resume/utils/string";
import { getTemplateMetadataForKind, getTemplatesForKind, templates } from "@/dialogs/resume/template/data";
import { TemplateCard } from "@/features/resume/templates/template-card";
import { getResumeErrorMessage, isBillingRestrictedError } from "@/libs/error-message";
import { orpc } from "@/libs/orpc/client";
import { DashboardHeader } from "./header";

type DocumentTemplatePickerProps = {
	kind: "resume" | "cover-letter";
	title: string;
	description: React.ReactNode;
	creatingToastMessage: string;
	createdToastMessage: string;
};

/**
 * Shared body for the "choose a template to start a new document" pages — same 16-model
 * grid plus published admin presets, parametrized by `kind` so resume and cover-letter
 * creation stay on one code path instead of drifting as two copies.
 */
export function DocumentTemplatePicker({
	kind,
	title,
	description,
	creatingToastMessage,
	createdToastMessage,
}: DocumentTemplatePickerProps) {
	const navigate = useNavigate();
	const { i18n } = useLingui();
	const [pending, setPending] = useState(false);

	// Preview tiles show sample content in the site's current language instead of always English.
	// Cover-letter previews use the same fill-in-the-blank placeholder letter that creating one
	// actually produces, so the tile matches the real result instead of showing a fictional example.
	const previewData = useMemo(() => {
		const sample = createSampleResumeData(undefined, i18n.locale as Locale);
		return kind === "cover-letter" ? buildPlaceholderCoverLetterData(sample, i18n.locale, generateId) : sample;
	}, [i18n.locale, kind]);

	const { data: presets = [] } = useQuery(orpc.templatePresets.listPublished.queryOptions({ input: { kind } }));
	const { data: subscription } = useQuery(orpc.billing.getMySubscription.queryOptions());
	const allowedTemplates = subscription?.plan.allowedTemplates;

	const { mutate: createResume } = useMutation(orpc.resume.create.mutationOptions());

	function createFrom(input: { template?: Template; templatePresetId?: string }) {
		if (pending) return;
		setPending(true);

		const randomName = generateRandomName();
		const toastId = toast.loading(creatingToastMessage);

		createResume(
			{ name: randomName, slug: slugify(randomName), tags: [], kind, withSampleData: true, ...input },
			{
				onSuccess: (id) => {
					toast.success(createdToastMessage, { id: toastId });
					void navigate({ to: "/builder/$resumeId", params: { resumeId: id } });
				},
				onError: (error) => {
					setPending(false);
					toast.error(getResumeErrorMessage(error), { id: toastId });
					if (isBillingRestrictedError(error)) void navigate({ to: "/dashboard/settings/billing" });
				},
			},
		);
	}

	return (
		<div className="space-y-4">
			<DashboardHeader icon={SlideshowIcon} title={title} />

			<p className="text-muted-foreground leading-relaxed">{description}</p>

			<ScrollArea className="h-[calc(100svh-12rem)]">
				<div className="grid grid-cols-2 gap-6 p-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
					{presets.map((preset) => (
						<TemplateCard
							key={preset.id}
							data={applyPresetConfig(previewData, preset.config)}
							metadata={getTemplateMetadataForKind(
								{ ...templates[preset.baseTemplate], name: preset.name } satisfies TemplateMetadata,
								kind,
							)}
							id={preset.id}
							template={preset.baseTemplate}
							locked={allowedTemplates ? !allowedTemplates.includes(preset.baseTemplate) : false}
							onSelect={(templatePresetId) => createFrom({ templatePresetId })}
						/>
					))}

					{getTemplatesForKind(kind)
						.filter(([template]) => template !== "custom")
						.map(([template, metadata]) => (
							<TemplateCard
								key={template}
								data={previewData}
								metadata={getTemplateMetadataForKind(metadata, kind)}
								id={template as Template}
								template={template as Template}
								locked={allowedTemplates ? !allowedTemplates.includes(template as Template) : false}
								onSelect={(selected) => createFrom({ template: selected })}
							/>
						))}
				</div>
			</ScrollArea>
		</div>
	);
}
