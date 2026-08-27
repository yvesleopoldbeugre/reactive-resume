import { t } from "@lingui/core/macro";
import { PlusIcon } from "@phosphor-icons/react";
import { useDialogStore } from "@/dialogs/store";
import { BaseCard } from "./base-card";

type CreateResumeCardProps = {
	kind?: "resume" | "cover-letter";
};

export function CreateResumeCard({ kind = "resume" }: CreateResumeCardProps) {
	const { openDialog } = useDialogStore();
	const isCoverLetter = kind === "cover-letter";

	return (
		<BaseCard
			title={isCoverLetter ? t`Create a new cover letter` : t`Create a new resume`}
			description={
				isCoverLetter ? t`Start writing your cover letter from scratch` : t`Start building your resume from scratch`
			}
			onClick={() => openDialog("resume.create", { kind })}
		>
			<div className="absolute inset-0 flex items-center justify-center">
				<PlusIcon weight="thin" className="size-12" />
			</div>
		</BaseCard>
	);
}
