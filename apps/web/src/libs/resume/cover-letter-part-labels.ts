import type { MessageDescriptor } from "@lingui/core";
import type { CoverLetterPartType } from "@reactive-resume/schema/resume/data";
import { msg } from "@lingui/core/macro";

export const COVER_LETTER_PART_TYPE_OPTIONS: { value: CoverLetterPartType; label: MessageDescriptor }[] = [
	{ value: "recipient", label: msg`Recipient` },
	{ value: "subject", label: msg`Subject` },
	{ value: "salutation", label: msg`Salutation` },
	{ value: "paragraph", label: msg`Paragraph` },
	{ value: "closing", label: msg`Closing` },
	{ value: "signature", label: msg`Signature` },
];

const coverLetterPartTypeMessages = Object.fromEntries(
	COVER_LETTER_PART_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<CoverLetterPartType, MessageDescriptor>;

export function getCoverLetterPartTypeLabel(partType: CoverLetterPartType): MessageDescriptor {
	return coverLetterPartTypeMessages[partType];
}

export function isCoverLetterPartType(value: string | null | undefined): value is CoverLetterPartType {
	return COVER_LETTER_PART_TYPE_OPTIONS.some((option) => option.value === value);
}
