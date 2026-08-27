import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";
import { DocumentTemplatePicker } from "../-components/document-template-picker";

export const Route = createFileRoute("/dashboard/templates/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<DocumentTemplatePicker
			kind="resume"
			title={t`Choose a template`}
			description={
				<Trans>
					Pick a template to start your new resume. We'll fill it with example content so you can see how it looks —
					just replace it with your own. You'll be able to switch templates at any time from the editor.
				</Trans>
			}
			creatingToastMessage={t`Creating your resume...`}
			createdToastMessage={t`Your resume has been created successfully.`}
		/>
	);
}
