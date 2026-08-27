import { t } from "@lingui/core/macro";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { createFileRoute, stripSearchParams, useNavigate } from "@tanstack/react-router";
import {
	DocumentListPage,
	documentListDefaultSearch,
	documentListSearchSchema,
} from "../-components/document-list-page";

export const Route = createFileRoute("/dashboard/cover-letters/")({
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
			kind="cover-letter"
			icon={EnvelopeSimpleIcon}
			title={t`Cover Letters`}
			searchPlaceholder={t`Search cover letters...`}
			search={search}
			onSearchChange={(updater) => void navigate({ search: updater })}
		/>
	);
}
