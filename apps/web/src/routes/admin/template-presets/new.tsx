import type { Icon } from "@phosphor-icons/react";
import type { Template } from "@reactive-resume/schema/templates";
import type { Locale } from "@reactive-resume/utils/locale";
import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { EnvelopeSimpleIcon, ReadCvLogoIcon, SlideshowIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { buildPlaceholderCoverLetterData } from "@reactive-resume/resume/cover-letter-placeholder";
import { createSampleResumeData } from "@reactive-resume/schema/resume/sample";
import { Badge } from "@reactive-resume/ui/components/badge";
import { Button } from "@reactive-resume/ui/components/button";
import { Input } from "@reactive-resume/ui/components/input";
import { Label } from "@reactive-resume/ui/components/label";
import { ScrollArea } from "@reactive-resume/ui/components/scroll-area";
import { generateId, generateRandomName, slugify } from "@reactive-resume/utils/string";
import { getTemplateMetadataForKind, getTemplatesForKind } from "@/dialogs/resume/template/data";
import { TemplateCard } from "@/features/resume/templates/template-card";
import { getTemplatePresetErrorMessage } from "@/libs/error-message";
import { orpc } from "@/libs/orpc/client";
import { AdminHeader } from "../-components/header";

export const Route = createFileRoute("/admin/template-presets/new")({
	component: RouteComponent,
});

type PresetKind = "resume" | "cover-letter";

function RouteComponent() {
	const navigate = useNavigate();
	const { i18n } = useLingui();
	const [name, setName] = useState(() => generateRandomName());
	const [kind, setKind] = useState<PresetKind | null>(null);
	const [pendingTemplate, setPendingTemplate] = useState<Template | null>(null);

	// A resume-kind preset previews as a full sample resume; a cover-letter-kind preset previews the
	// same fill-in-the-blank placeholder letter that creating a preset actually seeds, so this
	// matches what the picker tile will show once published.
	const previewData = useMemo(() => {
		const sample = createSampleResumeData(undefined, i18n.locale as Locale);
		return kind === "cover-letter" ? buildPlaceholderCoverLetterData(sample, i18n.locale, generateId) : sample;
	}, [i18n.locale, kind]);

	const { mutate: createPreset } = useMutation(orpc.templatePresets.create.mutationOptions());

	function onSelectTemplate(baseTemplate: Template) {
		if (!kind || pendingTemplate) return;
		if (!name.trim()) {
			toast.error(t`Give the preset a name first.`);
			return;
		}

		setPendingTemplate(baseTemplate);
		const toastId = toast.loading(t`Creating your template preset...`);

		createPreset(
			{ name: name.trim(), slug: slugify(name), baseTemplate, kind, config: {} },
			{
				onSuccess: (preset) => {
					toast.success(t`Your template preset has been created successfully.`, { id: toastId });
					void navigate({ to: "/admin/template-presets/$presetId", params: { presetId: preset.id } });
				},
				onError: (error) => {
					setPendingTemplate(null);
					toast.error(getTemplatePresetErrorMessage(error), { id: toastId });
				},
			},
		);
	}

	if (!kind) {
		return (
			<div className="space-y-4">
				<AdminHeader icon={SlideshowIcon} title={t`New Template Preset`} />

				<p className="text-muted-foreground leading-relaxed">
					<Trans>Is this preset for resumes or for cover letters? A preset is authored for one kind, not both.</Trans>
				</p>

				<div className="grid max-w-md grid-cols-1 gap-4 sm:grid-cols-2">
					<KindOption
						icon={ReadCvLogoIcon}
						title={t`Resume`}
						description={t`Appears in the resume template picker.`}
						onClick={() => setKind("resume")}
					/>
					<KindOption
						icon={EnvelopeSimpleIcon}
						title={t`Cover Letter`}
						description={t`Appears in the cover-letter template picker.`}
						onClick={() => setKind("cover-letter")}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<AdminHeader
				icon={SlideshowIcon}
				title={t`New Template Preset`}
				badge={
					<Badge variant="outline">
						{kind === "cover-letter" ? <Trans>Cover Letter</Trans> : <Trans>Resume</Trans>}
					</Badge>
				}
				actions={
					<Button variant="outline" size="sm" onClick={() => setKind(null)}>
						<Trans>Change</Trans>
					</Button>
				}
			/>

			<div className="max-w-sm space-y-1.5">
				<Label htmlFor="preset-name">
					<Trans>Name</Trans>
				</Label>
				<Input id="preset-name" value={name} onChange={(event) => setName(event.target.value)} />
			</div>

			<p className="text-muted-foreground leading-relaxed">
				<Trans>
					Choose a built-in template to start from. You'll be able to customize its colors and typography next.
				</Trans>
			</p>

			<ScrollArea className="h-[calc(100svh-16rem)]">
				<div className="grid grid-cols-2 gap-6 p-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
					{getTemplatesForKind(kind).map(([template, metadata]) => (
						<TemplateCard
							key={template}
							data={previewData}
							metadata={getTemplateMetadataForKind(metadata, kind)}
							id={template as Template}
							template={template as Template}
							onSelect={onSelectTemplate}
							blankIfCustom
						/>
					))}
				</div>
			</ScrollArea>
		</div>
	);
}

type KindOptionProps = {
	icon: Icon;
	title: string;
	description: string;
	onClick: () => void;
};

function KindOption({ icon: IconComponent, title, description, onClick }: KindOptionProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex flex-col items-start gap-y-3 rounded-lg border p-5 text-start transition-colors hover:border-primary hover:bg-secondary/30"
		>
			<div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
				<IconComponent size={20} weight="light" />
			</div>
			<div className="space-y-1">
				<h3 className="font-medium">{title}</h3>
				<p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
			</div>
		</button>
	);
}
