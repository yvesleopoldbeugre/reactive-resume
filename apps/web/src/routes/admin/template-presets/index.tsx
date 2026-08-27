import type { ReactNode } from "react";
import type { RouterOutput } from "@/libs/orpc/client";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { PlusIcon, SlideshowIcon, TrashSimpleIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@reactive-resume/ui/components/badge";
import { Button } from "@reactive-resume/ui/components/button";
import { Switch } from "@reactive-resume/ui/components/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@reactive-resume/ui/components/tabs";
import { templates } from "@/dialogs/resume/template/data";
import { useConfirm } from "@/hooks/use-confirm";
import { getTemplatePresetErrorMessage } from "@/libs/error-message";
import { orpc } from "@/libs/orpc/client";
import { AdminHeader } from "../-components/header";

export const Route = createFileRoute("/admin/template-presets/")({
	component: RouteComponent,
});

type Preset = RouterOutput["templatePresets"]["list"][number];
type PresetKind = "resume" | "cover-letter";

function RouteComponent() {
	const confirm = useConfirm();
	const queryClient = useQueryClient();
	const [tab, setTab] = useState<PresetKind>("resume");

	const { data: presets = [] } = useQuery(orpc.templatePresets.list.queryOptions());

	const invalidate = () => queryClient.invalidateQueries({ queryKey: orpc.templatePresets.list.queryKey() });

	const { mutate: setPublished } = useMutation(
		orpc.templatePresets.setPublished.mutationOptions({
			onSuccess: () => invalidate(),
			onError: (error) => toast.error(getTemplatePresetErrorMessage(error)),
		}),
	);

	const { mutate: deletePreset } = useMutation(
		orpc.templatePresets.delete.mutationOptions({
			onSuccess: () => {
				toast.success(t`The template preset has been deleted successfully.`);
				invalidate();
			},
			onError: (error) => toast.error(getTemplatePresetErrorMessage(error)),
		}),
	);

	const onDelete = async (id: string, name: string) => {
		const confirmation = await confirm(t`Delete "${name}"?`, {
			description: t`This preset will no longer appear in the template picker. Resumes already created from it are unaffected.`,
			confirmText: t`Delete`,
			cancelText: t`Cancel`,
		});

		if (confirmation) deletePreset({ id });
	};

	const resumePresets = presets.filter((preset) => preset.kind === "resume");
	const coverLetterPresets = presets.filter((preset) => preset.kind === "cover-letter");

	return (
		<div className="space-y-6">
			<AdminHeader
				icon={SlideshowIcon}
				title={t`Template Presets`}
				actions={
					<Button size="sm" render={<Link to="/admin/template-presets/new" />}>
						<PlusIcon />
						<Trans>New Preset</Trans>
					</Button>
				}
			/>

			<p className="text-muted-foreground leading-relaxed">
				<Trans>
					Presets are starting configurations (a built-in template plus colors, typography, style rules, and layout)
					that appear in the resume or cover-letter template picker once published. A preset is authored for one
					document kind, chosen when it's created.
				</Trans>
			</p>

			<Tabs value={tab} onValueChange={(value) => setTab(value as PresetKind)}>
				<TabsList className="w-fit">
					<TabsTrigger value="resume" className="flex-none px-3">
						<Trans>CV</Trans>
						<Badge variant="secondary" className="ms-1.5">
							{resumePresets.length}
						</Badge>
					</TabsTrigger>
					<TabsTrigger value="cover-letter" className="flex-none px-3">
						<Trans>Cover Letters</Trans>
						<Badge variant="secondary" className="ms-1.5">
							{coverLetterPresets.length}
						</Badge>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="resume">
					<PresetList
						presets={resumePresets}
						onDelete={onDelete}
						onSetPublished={setPublished}
						emptyMessage={<Trans>No resume presets yet.</Trans>}
					/>
				</TabsContent>

				<TabsContent value="cover-letter">
					<PresetList
						presets={coverLetterPresets}
						onDelete={onDelete}
						onSetPublished={setPublished}
						emptyMessage={<Trans>No cover-letter presets yet.</Trans>}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}

type PresetListProps = {
	presets: Preset[];
	emptyMessage: ReactNode;
	onDelete: (id: string, name: string) => void;
	onSetPublished: (input: { id: string; isPublished: boolean }) => void;
};

function PresetList({ presets, emptyMessage, onDelete, onSetPublished }: PresetListProps) {
	return (
		<div className="pt-1">
			<AnimatePresence initial={false} mode="popLayout">
				{presets.map((preset, index) => (
					<m.div
						key={preset.id}
						className="flex items-center gap-x-4 border-b py-4 will-change-[transform,opacity]"
						initial={{ opacity: 0, y: -16 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -16 }}
						transition={{ duration: 0.16, delay: Math.min(0.12, index * 0.04) }}
					>
						<div className="flex-1 space-y-1">
							<Link to="/admin/template-presets/$presetId" params={{ presetId: preset.id }} className="font-medium">
								{preset.name}
							</Link>
							<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-xs">
								<span>{templates[preset.baseTemplate].name}</span>
								<Badge variant={preset.isPublished ? "default" : "secondary"} className="text-xs">
									{preset.isPublished ? <Trans>Published</Trans> : <Trans>Draft</Trans>}
								</Badge>
							</div>
						</div>

						<div className="flex items-center gap-x-1.5">
							<span className="text-muted-foreground text-xs">
								<Trans>Published</Trans>
							</span>
							<Switch
								checked={preset.isPublished}
								onCheckedChange={(checked) => onSetPublished({ id: preset.id, isPublished: checked })}
							/>
						</div>

						<Button size="icon" variant="ghost" onClick={() => onDelete(preset.id, preset.name)}>
							<TrashSimpleIcon />
						</Button>
					</m.div>
				))}
			</AnimatePresence>

			{presets.length === 0 && <p className="text-muted-foreground text-sm">{emptyMessage}</p>}
		</div>
	);
}
