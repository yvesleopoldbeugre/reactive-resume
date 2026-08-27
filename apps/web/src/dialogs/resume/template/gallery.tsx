import type { Template } from "@reactive-resume/schema/templates";
import type { DialogProps } from "@/dialogs/store";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { SlideshowIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@reactive-resume/ui/components/dialog";
import { ScrollArea } from "@reactive-resume/ui/components/scroll-area";
import { useDialogStore } from "@/dialogs/store";
import { useCurrentResume, useUpdateResumeData } from "@/features/resume/builder/draft";
import { TemplateCard } from "@/features/resume/templates/template-card";
import { orpc } from "@/libs/orpc/client";
import { getTemplateMetadataForKind, getTemplatesForKind, templates } from "./data";

export function TemplateGalleryDialog(_: DialogProps<"resume.template.gallery">) {
	const closeDialog = useDialogStore((state) => state.closeDialog);
	const resume = useCurrentResume();
	const selectedTemplate = resume.data.metadata.template;
	const updateResumeData = useUpdateResumeData();
	const { data: subscription } = useQuery(orpc.billing.getMySubscription.queryOptions());
	const allowedTemplates = subscription?.plan.allowedTemplates;

	function onSelectTemplate(template: Template) {
		const previousTemplate = resume.data.metadata.template;
		if (template === previousTemplate) {
			closeDialog();
			return;
		}

		updateResumeData((draft) => {
			draft.metadata.template = template;
		});

		closeDialog();

		toast(t`Switched to the ${templates[template].name} template.`, {
			action: {
				label: t`Undo`,
				onClick: () => {
					updateResumeData((draft) => {
						draft.metadata.template = previousTemplate;
					});
				},
			},
		});
	}

	return (
		<DialogContent className="lg:max-w-6xl xl:max-w-7xl">
			<DialogHeader className="gap-2">
				<DialogTitle className="flex items-center gap-3 text-xl">
					<SlideshowIcon size={20} />
					<Trans>Template Gallery</Trans>
				</DialogTitle>
				<DialogDescription className="leading-relaxed">
					{resume.kind === "cover-letter" ? (
						<Trans>
							Here's a range of templates for different professions and personalities. Whether you prefer modern or
							classic, bold or simple, there is a design to match you. Look through the options below and choose a
							template that fits your style.
						</Trans>
					) : (
						<Trans>
							Here's a range of resume templates for different professions and personalities. Whether you prefer modern
							or classic, bold or simple, there is a design to match you. Look through the options below and choose a
							template that fits your style.
						</Trans>
					)}
				</DialogDescription>
			</DialogHeader>

			<ScrollArea className="max-h-[85svh] pb-8">
				<div className="grid grid-cols-2 gap-6 p-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
					{getTemplatesForKind(resume.kind)
						.filter(([template]) => template !== "custom")
						.map(([template, metadata]) => (
							<TemplateCard
								key={template}
								data={resume.data}
								metadata={getTemplateMetadataForKind(metadata, resume.kind)}
								id={template as Template}
								template={template as Template}
								isActive={template === selectedTemplate}
								// The currently-selected template is never locked, even if a downgrade since then
								// dropped it from the plan -- only *switching* to a new locked template is gated.
								locked={
									allowedTemplates && template !== selectedTemplate
										? !allowedTemplates.includes(template as Template)
										: false
								}
								onSelect={onSelectTemplate}
							/>
						))}
				</div>
			</ScrollArea>
		</DialogContent>
	);
}
