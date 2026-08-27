import type { LayoutPage, ResumeData, Typography } from "@reactive-resume/schema/resume/data";
import type { Template } from "@reactive-resume/schema/templates";
import type { Locale } from "@reactive-resume/utils/locale";
import type { ComponentType } from "react";
import type { ResumeRenderOptions } from "./context";
import type { SectionTitleResolver } from "./section-title";
import { useMemo } from "react";
import { BRAND } from "@reactive-resume/brand";
import { Document } from "#react-pdf-renderer";
import { RenderProvider } from "./context";
import { registerFonts, resumeContentContainsCJK, resumeContentScripts } from "./hooks/use-register-fonts";
import { getTemplatePage } from "./templates";

export type TemplatePageProps = {
	page: LayoutPage;
	pageIndex: number;
};

export type TemplatePage = ComponentType<TemplatePageProps>;

type ResumeDocumentProps = {
	data: ResumeData;
	template: Template;
	renderOptions?: ResumeRenderOptions | undefined;
	resolveSectionTitle?: SectionTitleResolver | undefined;
};

const getLayoutPageKey = (page: LayoutPage, pageIndex: number) =>
	`${page.fullWidth ? "full" : "split"}:${page.main.join(",")}:${page.sidebar.join(",")}:${pageIndex}`;

export const ResumeDocument = ({ data, template, renderOptions, resolveSectionTitle }: ResumeDocumentProps) => {
	const TemplatePageComponent = getTemplatePage(template);
	const creationDate = useMemo(() => new Date(), []);
	const hasCjkContent = useMemo(() => resumeContentContainsCJK(data), [data]);
	const scripts = useMemo(() => resumeContentScripts(data), [data]);
	const typography = registerFonts(
		data.metadata.typography,
		data.metadata.page.locale as Locale,
		hasCjkContent,
		scripts,
	) as Typography;

	// `registerFonts` widens `fontFamily` to `string | string[]` for CJK
	// fallback (#2986); the cast carries that wider runtime value through
	// `ResumeData` without changing the public schema. Also sync `template` into
	// `metadata.template` — a template gallery/preview tile renders `data` through a
	// *different* template than the one it's saved with, and template components that read
	// `data.metadata.template` (e.g. `shouldShowResumeHeader`) need to see the template
	// actually being rendered, not the document's stored preference.
	const resumeData = useMemo(
		() => ({ ...data, metadata: { ...data.metadata, template, typography } }),
		[data, template, typography],
	);

	return (
		<RenderProvider data={resumeData} resolveSectionTitle={resolveSectionTitle} renderOptions={renderOptions}>
			<Document
				pageMode="useNone"
				creationDate={creationDate}
				producer={BRAND.name}
				title={resumeData.basics.name}
				author={resumeData.basics.name}
				creator={resumeData.basics.name}
				subject={resumeData.basics.headline}
				language={resumeData.metadata.page.locale}
			>
				{resumeData.metadata.layout.pages.map((page, index) => (
					<TemplatePageComponent key={getLayoutPageKey(page, index)} page={page} pageIndex={index} />
				))}
			</Document>
		</RenderProvider>
	);
};
