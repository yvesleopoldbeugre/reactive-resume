import type { Icon } from "@phosphor-icons/react";
import { msg, t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import {
	DownloadSimpleIcon,
	GridFourIcon,
	ListIcon,
	MagnifyingGlassIcon,
	PlusIcon,
	SparkleIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import z from "zod";
import { Button } from "@reactive-resume/ui/components/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@reactive-resume/ui/components/input-group";
import { Label } from "@reactive-resume/ui/components/label";
import { Separator } from "@reactive-resume/ui/components/separator";
import { Tabs, TabsList, TabsTrigger } from "@reactive-resume/ui/components/tabs";
import { cn } from "@reactive-resume/utils/style";
import { Combobox } from "@/components/ui/combobox";
import { useDialogStore } from "@/dialogs/store";
import { orpc } from "@/libs/orpc/client";
import { GridView } from "../resumes/-components/grid-view";
import { ListView } from "../resumes/-components/list-view";
import { DashboardHeader } from "./header";

export const documentListSearchSchema = z.object({
	search: z.string().default(""),
	tags: z.array(z.string()).default([]),
	sort: z.enum(["lastUpdatedAt", "createdAt", "name"]).default("lastUpdatedAt"),
	view: z.enum(["grid", "list"]).default("grid"),
});

export type DocumentListSearch = z.output<typeof documentListSearchSchema>;

export const documentListDefaultSearch: DocumentListSearch = {
	search: "",
	tags: [],
	sort: "lastUpdatedAt",
	view: "grid",
};

type DocumentListPageProps = {
	kind: "resume" | "cover-letter";
	icon: Icon;
	title: string;
	searchPlaceholder: string;
	search: DocumentListSearch;
	onSearchChange: (updater: (prev: DocumentListSearch) => DocumentListSearch) => void;
};

/**
 * Shared body for the resumes and cover-letters dashboard list pages — same search/sort/tag
 * filtering, grid/list view toggle, and create/import actions, parametrized by document `kind`
 * so both routes stay in sync instead of drifting as two copies. Each route file owns its own
 * `Route.useSearch()`/`useNavigate()` (tied to that file's generated route) and passes the
 * current search state + a setter down as props.
 */
export function DocumentListPage({
	kind,
	icon,
	title,
	searchPlaceholder,
	search,
	onSearchChange,
}: DocumentListPageProps) {
	const { i18n } = useLingui();
	const { openDialog } = useDialogStore();
	const isCoverLetter = kind === "cover-letter";
	const { search: searchText, tags, sort, view } = search;

	const { data: allTags } = useQuery(orpc.resume.tags.list.queryOptions());
	const { data: documents } = useQuery(orpc.resume.list.queryOptions({ input: { tags, sort, kind } }));
	const { data: subscription } = useQuery(orpc.billing.getMySubscription.queryOptions());
	const documentLimit = subscription?.plan.documentLimit ?? null;

	const filteredDocuments = useMemo(() => {
		const list = documents ?? [];
		const query = searchText.trim().toLowerCase();
		if (!query) return list;
		return list.filter((doc) => doc.name.toLowerCase().includes(query) || doc.slug.toLowerCase().includes(query));
	}, [documents, searchText]);

	const tagOptions = useMemo(() => {
		if (!allTags) return [];
		return allTags.map((tag) => ({ value: tag, label: tag }));
	}, [allTags]);

	const sortOptions = useMemo(() => {
		return [
			{ value: "lastUpdatedAt", label: i18n.t(msg`Last Updated`) },
			{ value: "createdAt", label: i18n.t(msg`Created`) },
			{ value: "name", label: i18n.t(msg`Name`) },
		];
	}, [i18n]);

	return (
		<div className="space-y-4">
			<DashboardHeader
				icon={icon}
				title={title}
				actions={
					(documents?.length ?? 0) > 0 ? (
						<>
							<Button size="sm" variant="outline" onClick={() => openDialog("resume.create", { kind })}>
								<PlusIcon />
								<Trans>Create</Trans>
							</Button>
							{!isCoverLetter && (
								<Button size="sm" variant="outline" onClick={() => openDialog("resume.import", undefined)}>
									<DownloadSimpleIcon />
									<Trans>Import</Trans>
								</Button>
							)}
						</>
					) : undefined
				}
			/>

			{documentLimit !== null && (
				<Link
					to="/dashboard/settings/billing"
					className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground"
				>
					<SparkleIcon size={14} />
					<Trans>
						{subscription?.documentCount ?? 0} of {documentLimit} documents used — Upgrade for unlimited
					</Trans>
				</Link>
			)}

			<Separator />

			<div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center">
				<div className="grid min-w-0 gap-1.5 sm:flex sm:items-center sm:gap-2">
					<Label className="text-muted-foreground text-xs sm:text-sm">
						<Trans>Sort by</Trans>
					</Label>
					<Combobox
						className="w-full sm:w-44"
						value={sort}
						options={sortOptions}
						placeholder={t`Sort by`}
						onValueChange={(value) => {
							if (!value) return;
							onSearchChange((prev) => ({ ...prev, sort: value as DocumentListSearch["sort"] }));
						}}
					/>
				</div>

				<div
					className={cn("grid min-w-0 gap-1.5 sm:flex sm:items-center sm:gap-2", { hidden: tagOptions.length === 0 })}
				>
					<Label className="text-muted-foreground text-xs sm:text-sm">
						<Trans>Filter by</Trans>
					</Label>
					<Combobox
						multiple
						className="w-full sm:w-44"
						value={tags}
						options={tagOptions}
						placeholder={t`Filter by`}
						onValueChange={(value) => {
							onSearchChange((prev) => ({ ...prev, tags: value ?? [] }));
						}}
					/>
				</div>

				{(documents?.length ?? 0) > 5 && (
					<InputGroup className="w-full sm:w-56 lg:w-64">
						<InputGroupAddon align="inline-start">
							<MagnifyingGlassIcon />
						</InputGroupAddon>
						<InputGroupInput
							value={searchText}
							placeholder={searchPlaceholder}
							onChange={(event) => {
								const value = event.target.value;
								onSearchChange((prev) => ({ ...prev, search: value }));
							}}
						/>
					</InputGroup>
				)}

				<Tabs className="w-full sm:w-auto ltr:sm:ms-auto rtl:sm:me-auto" value={view}>
					<TabsList className="grid w-full grid-cols-2 sm:inline-flex sm:w-fit">
						<TabsTrigger
							value="grid"
							nativeButton={false}
							className="rounded-r-none"
							render={<Link to="." search={(prev: DocumentListSearch) => ({ ...prev, view: "grid" })} />}
						>
							<GridFourIcon />
							<Trans>Grid</Trans>
						</TabsTrigger>

						<TabsTrigger
							value="list"
							nativeButton={false}
							className="rounded-l-none"
							render={<Link to="." search={(prev: DocumentListSearch) => ({ ...prev, view: "list" })} />}
						>
							<ListIcon />
							<Trans>List</Trans>
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			{view === "list" ? (
				<ListView resumes={filteredDocuments} hasResumes={(documents?.length ?? 0) > 0} kind={kind} />
			) : (
				<GridView resumes={filteredDocuments} hasResumes={(documents?.length ?? 0) > 0} kind={kind} />
			)}
		</div>
	);
}
