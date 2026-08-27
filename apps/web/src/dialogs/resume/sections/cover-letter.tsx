import type z from "zod";
import type { DialogProps } from "@/dialogs/store";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { PencilSimpleLineIcon, PlusIcon } from "@phosphor-icons/react";
import { useStore } from "@tanstack/react-form";
import { coverLetterItemSchema } from "@reactive-resume/schema/resume/data";
import { FormControl, FormItem, FormLabel, FormMessage } from "@reactive-resume/ui/components/form";
import { RichInput } from "@/components/input/rich-input";
import { Combobox } from "@/components/ui/combobox";
import { useDialogStore } from "@/dialogs/store";
import { useUpdateResumeData } from "@/features/resume/builder/draft";
import { useFormBlocker } from "@/hooks/use-form-blocker";
import { COVER_LETTER_PART_TYPE_OPTIONS, isCoverLetterPartType } from "@/libs/resume/cover-letter-part-labels";
import { makeSectionItem } from "@/libs/resume/make-section-item";
import { useAppForm, withForm } from "@/libs/tanstack-form";
import { SectionItemDialog } from "./section-item-dialog";

const formSchema = coverLetterItemSchema;

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
	id: "",
	hidden: false,
	partType: "paragraph",
	content: "",
};

export function CreateCoverLetterDialog({ data }: DialogProps<"resume.sections.cover-letter.create">) {
	const closeDialog = useDialogStore((state) => state.closeDialog);
	const updateResumeData = useUpdateResumeData();

	const form = useAppForm({
		defaultValues: makeSectionItem(defaultValues, data?.item),
		validators: { onSubmit: formSchema },
		onSubmit: async ({ value }) => {
			updateResumeData((draft) => {
				if (data?.customSectionId) {
					const section = draft.customSections.find((s) => s.id === data.customSectionId);
					if (section) section.items.push(value);
				}
			});
			closeDialog();
		},
	});

	const { requestClose } = useFormBlocker(form);
	const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

	return (
		<SectionItemDialog
			title={<Trans>Create a new cover letter part</Trans>}
			icon={<PlusIcon />}
			onSubmit={() => void form.handleSubmit()}
			onCancel={requestClose}
			isSubmitting={isSubmitting}
			submitLabel={<Trans>Create</Trans>}
			singleColumn
		>
			<CoverLetterForm form={form} />
		</SectionItemDialog>
	);
}

export function UpdateCoverLetterDialog({ data }: DialogProps<"resume.sections.cover-letter.update">) {
	const closeDialog = useDialogStore((state) => state.closeDialog);
	const updateResumeData = useUpdateResumeData();

	const form = useAppForm({
		defaultValues: data.item,
		validators: { onSubmit: formSchema },
		onSubmit: async ({ value }) => {
			updateResumeData((draft) => {
				if (data?.customSectionId) {
					const section = draft.customSections.find((s) => s.id === data.customSectionId);
					if (!section) return;
					const index = section.items.findIndex((item) => item.id === value.id);
					if (index !== -1) section.items[index] = value;
				}
			});
			closeDialog();
		},
	});

	const { requestClose } = useFormBlocker(form);
	const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

	return (
		<SectionItemDialog
			title={<Trans>Update an existing cover letter part</Trans>}
			icon={<PencilSimpleLineIcon />}
			onSubmit={() => void form.handleSubmit()}
			onCancel={requestClose}
			isSubmitting={isSubmitting}
			submitLabel={<Trans>Save Changes</Trans>}
			singleColumn
		>
			<CoverLetterForm form={form} />
		</SectionItemDialog>
	);
}

const CoverLetterForm = withForm({
	defaultValues,
	render: ({ form }) => {
		const { i18n } = useLingui();

		return (
			<>
				<form.Field name="partType">
					{(field) => (
						<FormItem hasError={field.state.meta.isTouched && field.state.meta.errors.length > 0}>
							<FormLabel>
								<Trans>Part</Trans>
							</FormLabel>
							<FormControl
								render={
									<Combobox
										name={field.name}
										value={field.state.value}
										disabled={false}
										onValueChange={(v) => {
											if (isCoverLetterPartType(v)) field.handleChange(v);
										}}
										options={COVER_LETTER_PART_TYPE_OPTIONS.map((option) => ({
											value: option.value,
											label: i18n.t(option.label),
										}))}
									/>
								}
							/>
							<FormMessage errors={field.state.meta.errors} />
						</FormItem>
					)}
				</form.Field>

				<form.Field name="content">
					{(field) => (
						<FormItem hasError={field.state.meta.isTouched && field.state.meta.errors.length > 0}>
							<FormLabel>
								<Trans>Content</Trans>
							</FormLabel>
							<FormControl render={<RichInput value={field.state.value} onChange={(v) => field.handleChange(v)} />} />
							<FormMessage errors={field.state.meta.errors} />
						</FormItem>
					)}
				</form.Field>
			</>
		);
	},
});
