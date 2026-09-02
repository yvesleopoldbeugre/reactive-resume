import type { CoverLetterPlaceholderPart } from "@reactive-resume/resume/cover-letter-placeholder";
import type { Skin } from "@reactive-resume/schema/resume/skin";
import type { Template } from "@reactive-resume/schema/templates";
import type { Locale } from "@reactive-resume/utils/locale";
import type { ReactNode } from "react";
import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import {
	FloppyDiskIcon,
	NotePencilIcon,
	PaletteIcon,
	PencilSimpleIcon,
	SlideshowIcon,
	StackIcon,
	TextTIcon,
	TrashSimpleIcon,
} from "@phosphor-icons/react";
import { useStore } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	buildPlaceholderCoverLetterData,
	getCoverLetterPlaceholderParts,
} from "@reactive-resume/resume/cover-letter-placeholder";
import { applyPresetConfig } from "@reactive-resume/resume/preset";
import { colorDesignSchema, typographySchema } from "@reactive-resume/schema/resume/data";
import { defaultResumeData } from "@reactive-resume/schema/resume/default";
import { createSampleResumeData } from "@reactive-resume/schema/resume/sample";
import { defaultSkin } from "@reactive-resume/schema/resume/skin";
import { Badge } from "@reactive-resume/ui/components/badge";
import { Button } from "@reactive-resume/ui/components/button";
import { ButtonGroup } from "@reactive-resume/ui/components/button-group";
import { FormControl, FormItem, FormLabel, FormMessage } from "@reactive-resume/ui/components/form";
import { Input } from "@reactive-resume/ui/components/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@reactive-resume/ui/components/input-group";
import { Label } from "@reactive-resume/ui/components/label";
import { Separator } from "@reactive-resume/ui/components/separator";
import { Switch } from "@reactive-resume/ui/components/switch";
import { generateId } from "@reactive-resume/utils/string";
import { ColorPicker } from "@/components/input/color-picker";
import { RichInput } from "@/components/input/rich-input";
import { FontFamilyCombobox, FontWeightCombobox } from "@/components/typography/combobox";
import { getNextWeights } from "@/components/typography/get-next-weights";
import { getTemplateMetadataForKind, getTemplatesForKind, templates } from "@/dialogs/resume/template/data";
import { TemplateCard } from "@/features/resume/templates/template-card";
import { useConfirm } from "@/hooks/use-confirm";
import { useSyncFormValues } from "@/hooks/use-sync-form-values";
import { getTemplatePresetErrorMessage } from "@/libs/error-message";
import { orpc } from "@/libs/orpc/client";
import { getCoverLetterPartTypeLabel } from "@/libs/resume/cover-letter-part-labels";
import { useAppForm } from "@/libs/tanstack-form";
import { AdminHeader } from "../-components/header";

export const Route = createFileRoute("/admin/template-presets/$presetId")({
	component: RouteComponent,
});

type ColorValues = typeof defaultResumeData.metadata.design.colors;
type TypographyValues = typeof defaultResumeData.metadata.typography;

function RouteComponent() {
	const { presetId } = Route.useParams();
	const navigate = useNavigate();
	const { i18n } = useLingui();
	const confirm = useConfirm();
	const queryClient = useQueryClient();

	const { data: preset } = useQuery(orpc.templatePresets.getById.queryOptions({ input: { id: presetId } }));

	const [name, setName] = useState("");
	const [baseTemplate, setBaseTemplate] = useState<Template>("onyx");
	const [colors, setColors] = useState<ColorValues>(defaultResumeData.metadata.design.colors);
	const [typography, setTypography] = useState<TypographyValues>(defaultResumeData.metadata.typography);
	const [skin, setSkin] = useState<Skin>(defaultSkin);
	const [coverLetterParts, setCoverLetterParts] = useState<CoverLetterPlaceholderPart[]>([]);
	const [isChangingTemplate, setIsChangingTemplate] = useState(false);

	useEffect(() => {
		if (!preset) return;
		setName(preset.name);
		setBaseTemplate(preset.baseTemplate);
		setColors(preset.config.colors ?? defaultResumeData.metadata.design.colors);
		setTypography(preset.config.typography ?? defaultResumeData.metadata.typography);
		setSkin(preset.config.skin ?? defaultSkin);
		// A brand-new cover-letter preset has no saved text yet -- start from the same generic
		// placeholder real documents fall back to, so there's always something to edit and preview.
		// Deliberately keyed on `preset` only: this should re-seed the editor when the preset
		// itself (re)loads, not on every locale change while already editing.
		setCoverLetterParts(preset.config.coverLetterParts ?? getCoverLetterPlaceholderParts(i18n.locale));
	}, [preset, i18n.locale]);

	// A preset is fixed to the document kind it was created for, so the preview always renders
	// that kind — a resume-kind preset never needs a cover-letter preview and vice versa.
	const previewData = useMemo(() => {
		const sample = createSampleResumeData(undefined, i18n.locale as Locale);
		const configured = applyPresetConfig(sample, { colors, typography, skin });
		return preset?.kind === "cover-letter"
			? buildPlaceholderCoverLetterData(configured, i18n.locale, generateId, coverLetterParts)
			: configured;
	}, [colors, typography, skin, coverLetterParts, i18n.locale, preset?.kind]);

	const { mutate: updatePreset, isPending: isSaving } = useMutation(orpc.templatePresets.update.mutationOptions());
	const { mutate: setPublished } = useMutation(
		orpc.templatePresets.setPublished.mutationOptions({
			onSuccess: () => {
				void queryClient.invalidateQueries({
					queryKey: orpc.templatePresets.getById.queryKey({ input: { id: presetId } }),
				});
			},
			onError: (error) => toast.error(getTemplatePresetErrorMessage(error)),
		}),
	);
	const { mutate: deletePreset } = useMutation(
		orpc.templatePresets.delete.mutationOptions({
			onSuccess: () => {
				toast.success(t`The template preset has been deleted successfully.`);
				void navigate({ to: "/admin/template-presets" });
			},
			onError: (error) => toast.error(getTemplatePresetErrorMessage(error)),
		}),
	);

	const onSave = () => {
		updatePreset(
			{
				id: presetId,
				name: name.trim(),
				baseTemplate,
				config: {
					colors,
					typography,
					skin,
					...(preset?.kind === "cover-letter" ? { coverLetterParts } : {}),
				},
			},
			{
				onSuccess: () => {
					toast.success(t`Your template preset has been saved successfully.`);
					void queryClient.invalidateQueries({
						queryKey: orpc.templatePresets.getById.queryKey({ input: { id: presetId } }),
					});
				},
				onError: (error) => toast.error(getTemplatePresetErrorMessage(error)),
			},
		);
	};

	const onDelete = async () => {
		const confirmation = await confirm(t`Delete "${name}"?`, {
			description: t`This preset will no longer appear in the template picker. Resumes already created from it are unaffected.`,
			confirmText: t`Delete`,
			cancelText: t`Cancel`,
		});

		if (confirmation) deletePreset({ id: presetId });
	};

	if (!preset) return null;

	return (
		<div className="space-y-6">
			<AdminHeader
				icon={SlideshowIcon}
				title={preset.name}
				badge={
					<Badge variant="outline">
						{preset.kind === "cover-letter" ? <Trans>Cover Letter</Trans> : <Trans>Resume</Trans>}
					</Badge>
				}
				actions={
					<>
						<div className="flex items-center gap-x-1.5">
							<span className="text-muted-foreground text-xs">
								<Trans>Published</Trans>
							</span>
							<Switch
								checked={preset.isPublished}
								onCheckedChange={(checked) => setPublished({ id: presetId, isPublished: checked })}
							/>
						</div>
						<Button size="icon" variant="ghost" onClick={onDelete}>
							<TrashSimpleIcon />
						</Button>
						<Button size="sm" onClick={onSave} disabled={isSaving}>
							<FloppyDiskIcon />
							<Trans context="Save the template preset being edited">Save</Trans>
						</Button>
					</>
				}
			/>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
				<div className="space-y-8">
					<div className="max-w-sm space-y-1.5">
						<Label htmlFor="preset-name">
							<Trans>Name</Trans>
						</Label>
						<Input id="preset-name" value={name} onChange={(event) => setName(event.target.value)} />
					</div>

					<section className="space-y-3">
						<div className="flex items-center justify-between">
							<h2 className="flex items-center gap-x-2 font-semibold text-lg">
								<SlideshowIcon />
								<Trans>Base Template</Trans>
							</h2>
							{!isChangingTemplate && (
								<Button variant="outline" size="sm" onClick={() => setIsChangingTemplate(true)}>
									<PencilSimpleIcon />
									<Trans>Change</Trans>
								</Button>
							)}
						</div>

						{isChangingTemplate ? (
							<div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
								{getTemplatesForKind(preset.kind).map(([template, metadata]) => (
									<TemplateCard
										key={template}
										data={previewData}
										metadata={getTemplateMetadataForKind(metadata, preset.kind)}
										id={template as Template}
										template={template as Template}
										isActive={template === baseTemplate}
										onSelect={(selected) => {
											setBaseTemplate(selected);
											setIsChangingTemplate(false);
										}}
									/>
								))}
							</div>
						) : (
							<div className="flex flex-wrap items-center gap-1.5">
								<Badge>{templates[baseTemplate].name}</Badge>
								{templates[baseTemplate].tags.map((tag) => (
									<Badge key={tag} variant="secondary" className="text-xs">
										{tag}
									</Badge>
								))}
							</div>
						)}
					</section>

					{baseTemplate === "custom" && (
						<>
							<Separator />

							<section className="space-y-5">
								<h2 className="flex items-center gap-x-2 font-semibold text-lg">
									<StackIcon />
									<Trans>Structure</Trans>
								</h2>
								<SkinForm skin={skin} onChange={setSkin} />
							</section>
						</>
					)}

					<Separator />

					<section className="space-y-3">
						<h2 className="flex items-center gap-x-2 font-semibold text-lg">
							<PaletteIcon />
							<Trans>Colors</Trans>
						</h2>
						<ColorsForm colors={colors} onChange={setColors} />
					</section>

					<Separator />

					<section className="space-y-3">
						<h2 className="flex items-center gap-x-2 font-semibold text-lg">
							<TextTIcon />
							<Trans>Typography</Trans>
						</h2>
						<TypographyForm typography={typography} onChange={setTypography} />
					</section>

					{preset.kind === "cover-letter" && (
						<>
							<Separator />

							<section className="space-y-3">
								<h2 className="flex items-center gap-x-2 font-semibold text-lg">
									<NotePencilIcon />
									<Trans>Letter text</Trans>
								</h2>
								<p className="text-muted-foreground text-sm leading-relaxed">
									<Trans>
										The starting text for cover letters created from this preset, in place of the generic
										fill-in-the-blank placeholder.
									</Trans>
								</p>
								<CoverLetterContentForm parts={coverLetterParts} onChange={setCoverLetterParts} />
							</section>
						</>
					)}
				</div>

				<div className="lg:sticky lg:top-4 lg:self-start">
					<Label>
						<Trans>Preview</Trans>
					</Label>
					<div className="mt-1.5 max-w-[320px]">
						<TemplateCard
							data={previewData}
							metadata={getTemplateMetadataForKind(templates[baseTemplate], preset.kind)}
							id={baseTemplate}
							template={baseTemplate}
							onSelect={() => {}}
						/>
					</div>
					<Badge variant="secondary" className="mt-2">
						{templates[baseTemplate].name}
					</Badge>
				</div>
			</div>
		</div>
	);
}

type SegmentedOption<T extends string> = {
	value: T;
	label: ReactNode;
};

type SegmentedControlProps<T extends string> = {
	value: T;
	onChange: (value: T) => void;
	options: readonly SegmentedOption<T>[];
};

function SegmentedControl<T extends string>({ value, onChange, options }: SegmentedControlProps<T>) {
	return (
		<ButtonGroup>
			{options.map((option) => (
				<Button
					key={option.value}
					type="button"
					size="sm"
					variant={option.value === value ? "default" : "outline"}
					onClick={() => onChange(option.value)}
				>
					{option.label}
				</Button>
			))}
		</ButtonGroup>
	);
}

type SkinFieldProps = {
	label: ReactNode;
	children: ReactNode;
};

function SkinField({ label, children }: SkinFieldProps) {
	return (
		<div className="space-y-1.5">
			<Label>{label}</Label>
			{children}
		</div>
	);
}

type SkinFormProps = {
	skin: Skin;
	onChange: (skin: Skin) => void;
};

function SkinForm({ skin, onChange }: SkinFormProps) {
	const isColumns = skin.skeleton === "columns";

	return (
		<div className="space-y-5">
			<SkinField label={<Trans>Skeleton</Trans>}>
				<SegmentedControl
					value={skin.skeleton}
					onChange={(skeleton) => onChange({ ...skin, skeleton })}
					options={[
						{ value: "stacked", label: <Trans>Stacked</Trans> },
						{ value: "columns", label: <Trans>Columns</Trans> },
					]}
				/>
			</SkinField>

			{isColumns && (
				<>
					<SkinField label={<Trans>Header placement</Trans>}>
						<SegmentedControl
							value={skin.header.placement}
							onChange={(placement) => onChange({ ...skin, header: { ...skin.header, placement } })}
							options={[
								{ value: "full-width", label: <Trans>Full width</Trans> },
								{ value: "main", label: <Trans>Main column</Trans> },
								{ value: "sidebar", label: <Trans>Sidebar</Trans> },
							]}
						/>
					</SkinField>

					<SkinField label={<Trans>Sidebar position</Trans>}>
						<SegmentedControl
							value={skin.sidebar.position}
							onChange={(position) => onChange({ ...skin, sidebar: { ...skin.sidebar, position } })}
							options={[
								{ value: "before", label: <Trans>Before main</Trans> },
								{ value: "after", label: <Trans>After main</Trans> },
							]}
						/>
					</SkinField>

					<SkinField label={<Trans>Sidebar fill</Trans>}>
						<SegmentedControl
							value={skin.sidebar.fill}
							onChange={(fill) => onChange({ ...skin, sidebar: { ...skin.sidebar, fill } })}
							options={[
								{ value: "none", label: <Trans>None</Trans> },
								{ value: "solid", label: <Trans>Solid</Trans> },
								{ value: "tint", label: <Trans>Tint</Trans> },
							]}
						/>
					</SkinField>

					{skin.sidebar.fill === "tint" && (
						<SkinField label={<Trans>Tint opacity</Trans>}>
							<InputGroup className="max-w-32">
								<InputGroupInput
									type="number"
									min={0}
									max={1}
									step={0.05}
									value={skin.sidebar.tintOpacity}
									onChange={(event) => {
										const value = Number(event.target.value);
										onChange({
											...skin,
											sidebar: { ...skin.sidebar, tintOpacity: Number.isNaN(value) ? 0 : value },
										});
									}}
								/>
							</InputGroup>
						</SkinField>
					)}

					<SkinField label={<Trans>Sidebar text color</Trans>}>
						<SegmentedControl
							value={skin.sidebar.foreground}
							onChange={(foreground) => onChange({ ...skin, sidebar: { ...skin.sidebar, foreground } })}
							options={[
								{ value: "default", label: <Trans>Default</Trans> },
								{ value: "inverted", label: <Trans>Inverted</Trans> },
							]}
						/>
					</SkinField>
				</>
			)}

			<SkinField label={<Trans>Header alignment</Trans>}>
				<SegmentedControl
					value={skin.header.align}
					onChange={(align) => onChange({ ...skin, header: { ...skin.header, align } })}
					options={[
						{ value: "center", label: <Trans>Centered</Trans> },
						{ value: "start", label: <Trans>Start</Trans> },
					]}
				/>
			</SkinField>

			<SkinField label={<Trans>Picture placement</Trans>}>
				<SegmentedControl
					value={skin.header.picturePlacement}
					onChange={(picturePlacement) => onChange({ ...skin, header: { ...skin.header, picturePlacement } })}
					options={[
						{ value: "none", label: <Trans>None</Trans> },
						{ value: "block-start", label: <Trans>Above</Trans> },
						{ value: "inline-start", label: <Trans>Start</Trans> },
						{ value: "inline-end", label: <Trans>End</Trans> },
					]}
				/>
			</SkinField>

			<SkinField label={<Trans>Heading decoration</Trans>}>
				<SegmentedControl
					value={skin.heading.decoration}
					onChange={(decoration) => onChange({ ...skin, heading: { decoration } })}
					options={[
						{ value: "plain", label: <Trans>Plain</Trans> },
						{ value: "underline", label: <Trans>Underline</Trans> },
						{ value: "uppercase", label: <Trans>Uppercase</Trans> },
						{ value: "centered", label: <Trans>Centered</Trans> },
					]}
				/>
			</SkinField>

			<SkinField label={<Trans>Divider</Trans>}>
				<SegmentedControl
					value={skin.divider}
					onChange={(divider) => onChange({ ...skin, divider })}
					options={[
						{ value: "none", label: <Trans>None</Trans> },
						{ value: "timeline", label: <Trans>Timeline</Trans> },
						{ value: "left-border", label: <Trans>Left border</Trans> },
						{ value: "top-bar", label: <Trans>Top bar</Trans> },
					]}
				/>
			</SkinField>
		</div>
	);
}

type CoverLetterContentFormProps = {
	parts: CoverLetterPlaceholderPart[];
	onChange: (parts: CoverLetterPlaceholderPart[]) => void;
};

function CoverLetterContentForm({ parts, onChange }: CoverLetterContentFormProps) {
	const { i18n } = useLingui();

	// Paragraphs repeat, so a raw part-type label alone can't tell them apart -- number same-type
	// parts as they appear (e.g. two "paragraph" items become "Paragraph 1"/"Paragraph 2").
	const seenCounts = new Map<CoverLetterPlaceholderPart["partType"], number>();

	return (
		<div className="space-y-4">
			{parts.map((part, index) => {
				const occurrence = (seenCounts.get(part.partType) ?? 0) + 1;
				seenCounts.set(part.partType, occurrence);
				const repeatsType = parts.filter((p) => p.partType === part.partType).length > 1;
				const label = i18n._(getCoverLetterPartTypeLabel(part.partType));

				return (
					<FormItem key={`${part.partType}-${index}`}>
						<FormLabel>{repeatsType ? `${label} ${occurrence}` : label}</FormLabel>
						<FormControl
							render={
								<RichInput
									value={part.content}
									onChange={(content) => {
										const next = [...parts];
										next[index] = { ...part, content };
										onChange(next);
									}}
								/>
							}
						/>
					</FormItem>
				);
			})}
		</div>
	);
}

type ColorsFormProps = {
	colors: ColorValues;
	onChange: (colors: ColorValues) => void;
};

function useColorsForm(colors: ColorValues, onChange: (colors: ColorValues) => void) {
	const form = useAppForm({
		defaultValues: colors,
		validators: { onChange: colorDesignSchema },
		listeners: { onChange: ({ formApi }) => onChange(formApi.state.values) },
		onSubmit: ({ value }) => onChange(value),
	});
	useSyncFormValues(form, colors);
	return form;
}

type ColorsForm = ReturnType<typeof useColorsForm>;

function ColorsForm({ colors, onChange }: ColorsFormProps) {
	const form = useColorsForm(colors, onChange);

	return (
		<div className="grid gap-4 sm:grid-cols-3">
			<ColorField form={form} name="primary" label={<Trans>Primary Color</Trans>} />
			<ColorField form={form} name="text" label={<Trans>Text Color</Trans>} />
			<ColorField form={form} name="background" label={<Trans>Background Color</Trans>} />
		</div>
	);
}

type ColorFieldProps = {
	form: ColorsForm;
	name: keyof ColorValues;
	label: ReactNode;
};

function ColorField({ form, name, label }: ColorFieldProps) {
	return (
		<form.Field name={name}>
			{(field) => (
				<FormItem hasError={field.state.meta.isTouched && field.state.meta.errors.length > 0}>
					<FormLabel>{label}</FormLabel>
					<div className="flex items-center gap-2">
						<ColorPicker value={field.state.value} onChange={(color) => field.handleChange(color)} />
						<FormControl
							render={
								<Input
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
							}
						/>
					</div>
					<FormMessage errors={field.state.meta.errors} />
				</FormItem>
			)}
		</form.Field>
	);
}

type TypographyFormProps = {
	typography: TypographyValues;
	onChange: (typography: TypographyValues) => void;
};

function useTypographyForm(typography: TypographyValues, onChange: (typography: TypographyValues) => void) {
	const form = useAppForm({
		defaultValues: typography,
		validators: { onChange: typographySchema },
		listeners: { onChange: ({ formApi }) => onChange(formApi.state.values) },
		onSubmit: ({ value }) => onChange(value),
	});
	useSyncFormValues(form, typography);
	return form;
}

type TypographyForm = ReturnType<typeof useTypographyForm>;

function TypographyForm({ typography, onChange }: TypographyFormProps) {
	const form = useTypographyForm(typography, onChange);

	return (
		<div className="grid @md:grid-cols-2 grid-cols-1 gap-4">
			<TypographyGroupLabel label={<Trans context="Body Text (paragraphs, lists, etc.)">Body</Trans>} />
			<TypographyGroupFields form={form} prefix="body" />
			<TypographyGroupLabel label={<Trans context="Headings or Titles">Heading</Trans>} />
			<TypographyGroupFields form={form} prefix="heading" />
		</div>
	);
}

type TypographyGroupFieldsProps = {
	form: TypographyForm;
	prefix: "body" | "heading";
};

function TypographyGroupFields({ form, prefix }: TypographyGroupFieldsProps) {
	const fontFamily = useStore(form.store, (s) => s.values[prefix].fontFamily);

	return (
		<>
			<form.Field name={`${prefix}.fontFamily`}>
				{(field) => (
					<FormItem
						className="col-span-full"
						hasError={field.state.meta.isTouched && field.state.meta.errors.length > 0}
					>
						<FormLabel>
							<Trans>Font Family</Trans>
						</FormLabel>
						<FormControl
							render={
								<FontFamilyCombobox
									value={field.state.value}
									className="text-base"
									onValueChange={(value: string | null) => {
										if (value === null) return;
										field.handleChange(value);
										const nextWeights = getNextWeights(value);
										if (nextWeights) form.setFieldValue(`${prefix}.fontWeights`, nextWeights);
									}}
								/>
							}
						/>
						<FormMessage errors={field.state.meta.errors} />
					</FormItem>
				)}
			</form.Field>

			<form.Field name={`${prefix}.fontWeights`}>
				{(field) => (
					<FormItem
						className="col-span-full"
						hasError={field.state.meta.isTouched && field.state.meta.errors.length > 0}
					>
						<FormLabel>{prefix === "body" ? <Trans>Font Weights</Trans> : <Trans>Font Weight</Trans>}</FormLabel>
						<FormControl
							render={
								<FontWeightCombobox
									value={field.state.value}
									fontFamily={fontFamily}
									onValueChange={(value) => {
										if (value?.length === 0) return;
										field.handleChange(value as TypographyValues["body"]["fontWeights"]);
									}}
								/>
							}
						/>
						<FormMessage errors={field.state.meta.errors} />
					</FormItem>
				)}
			</form.Field>

			<form.Field name={`${prefix}.fontSize`}>
				{(field) => (
					<FormItem hasError={field.state.meta.isTouched && field.state.meta.errors.length > 0}>
						<FormLabel>
							<Trans>Font Size</Trans>
						</FormLabel>
						<InputGroup>
							<FormControl
								render={
									<InputGroupInput
										name={field.name}
										value={field.state.value}
										min={6}
										max={24}
										step={0.1}
										type="number"
										onBlur={field.handleBlur}
										onChange={(event) => {
											const value = event.target.value;
											field.handleChange(value === "" ? ("" as unknown as number) : Number(value));
										}}
									/>
								}
							/>
							<InputGroupAddon align="inline-end">
								<InputGroupText>pt</InputGroupText>
							</InputGroupAddon>
						</InputGroup>
					</FormItem>
				)}
			</form.Field>

			<form.Field name={`${prefix}.lineHeight`}>
				{(field) => (
					<FormItem hasError={field.state.meta.isTouched && field.state.meta.errors.length > 0}>
						<FormLabel>
							<Trans>Line Height</Trans>
						</FormLabel>
						<InputGroup>
							<FormControl
								render={
									<InputGroupInput
										name={field.name}
										value={field.state.value}
										min={0.5}
										max={4}
										step={0.05}
										type="number"
										onBlur={field.handleBlur}
										onChange={(event) => {
											const value = event.target.value;
											field.handleChange(value === "" ? ("" as unknown as number) : Number(value));
										}}
									/>
								}
							/>
							<InputGroupAddon align="inline-end">
								<InputGroupText>x</InputGroupText>
							</InputGroupAddon>
						</InputGroup>
					</FormItem>
				)}
			</form.Field>
		</>
	);
}

type TypographyGroupLabelProps = {
	label: ReactNode;
};

function TypographyGroupLabel({ label }: TypographyGroupLabelProps) {
	return (
		<div className="col-span-full flex items-center gap-x-2">
			<Separator className="basis-[16px]" />
			<div className="shrink-0 font-medium text-base leading-none">{label}</div>
			<Separator className="flex-1" />
		</div>
	);
}
