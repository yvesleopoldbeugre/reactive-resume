import type { Locale } from "@reactive-resume/utils/locale";
import { useLingui } from "@lingui/react";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useMemo } from "react";
import { useIsClient } from "usehooks-ts";
import { createSampleResumeData } from "@reactive-resume/schema/resume/sample";
import { templateSchema } from "@reactive-resume/schema/templates";
import { useLocalizedResumeDocument } from "@/features/resume/export/pdf-document";
import { createNoindexFollowMeta } from "@/libs/seo";

const PDFViewer = lazy(async () => {
	const { PDFViewer } = await import("@react-pdf/renderer");
	return { default: PDFViewer };
});

export const Route = createFileRoute("/templates/$")({
	component: TemplatePdfRoute,
	errorComponent: () => <div>Template not found</div>,
	head: () => ({
		meta: [createNoindexFollowMeta()],
	}),
});

function TemplatePdfRoute() {
	const isClient = useIsClient();
	const params = Route.useParams();
	const { i18n } = useLingui();

	const templateName = params._splat?.split(".")[0] ?? "azurill";
	const template = templateSchema.parse(templateName);
	const sampleResumeData = useMemo(() => createSampleResumeData(undefined, i18n.locale as Locale), [i18n.locale]);
	const resumeDocument = useLocalizedResumeDocument(sampleResumeData, template);

	if (!isClient || !resumeDocument) return null;

	return (
		<Suspense fallback={null}>
			<PDFViewer showToolbar={false} style={{ height: "100svh", width: "100svw", border: "none" }}>
				{resumeDocument}
			</PDFViewer>
		</Suspense>
	);
}
