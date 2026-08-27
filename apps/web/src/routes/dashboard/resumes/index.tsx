import { t } from "@lingui/core/macro";
import { ReadCvLogoIcon } from "@phosphor-icons/react";
import { createFileRoute, stripSearchParams, useNavigate } from "@tanstack/react-router";
import {
	DocumentListPage,
	documentListDefaultSearch,
	documentListSearchSchema,
} from "../-components/document-list-page";

export const Route = createFileRoute("/dashboard/resumes/")({
	component: RouteComponent,
	validateSearch: documentListSearchSchema,
	search: {
		middlewares: [stripSearchParams(documentListDefaultSearch)],
	},
});

function RouteComponent() {
	const search = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });

	return (
		<DocumentListPage
			kind="resume"
			icon={ReadCvLogoIcon}
			title={t`Resumes`}
			searchPlaceholder={t`Search resumes...`}
			search={search}
			onSearchChange={(updater) => void navigate({ search: updater })}
		/>
	);
}
