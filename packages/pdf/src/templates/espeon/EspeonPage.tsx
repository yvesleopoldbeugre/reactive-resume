import type { Style } from "@react-pdf/types";
import type { TemplatePageProps } from "../../document";
import type { TemplateColorRoles, TemplateStyleContext, TemplateStyleSlots } from "../shared/types";
import { useMemo } from "react";
import { rgbaStringToHex } from "@reactive-resume/utils/color";
import { Page, StyleSheet, View } from "#react-pdf-renderer";
import { useRender } from "../../context";
import { createBaseTemplateStyles } from "../shared/base-template-styles";
import { TemplateProvider } from "../shared/context";
import { shouldShowResumeHeader } from "../shared/cover-letter";
import { filterSections } from "../shared/filtering";
import { LetterHeader } from "../shared/letter-header";
import { getTemplateMetrics } from "../shared/metrics";
import { getTemplatePageMinHeightStyle, getTemplatePageSize } from "../shared/page-size";
import { createRtlStyleHelpers } from "../shared/rtl";
import { Section } from "../shared/sections";
import { composeStyles, headerNameLineHeight } from "../shared/styles";

type EspeonStyles = Omit<TemplateStyleSlots, "page"> & {
	page: Style;
	layout: Style;
	sidebarColumn: Style;
	mainColumn: Style;
	headerIdentity: Style;
	headerName: Style;
	headerText: Style;
	contactList: Style;
	contactItem: Style;
};

type EspeonTemplate = {
	colors: TemplateColorRoles;
	styles: EspeonStyles;
};

/**
 * A decorative colored side column holding the sender's identity, letter body in a plain main
 * column beside it. Unlike a CV template's sidebar, this column is never populated by
 * `page.sidebar` sections — a cover letter's layout always collapses to one full-width page
 * with an empty sidebar, so this column renders `data.basics` directly instead. Dedicated to
 * cover letters (see `templateKindMap`).
 */
export const EspeonPage = ({ page, pageIndex }: TemplatePageProps) => {
	const data = useRender();
	const { metadata } = data;
	const { colors, styles } = useEspeonTemplate();
	const metrics = getTemplateMetrics(metadata.page);
	const pageSize = getTemplatePageSize(metadata.page.format);
	const pageMinHeightStyle = getTemplatePageMinHeightStyle(metadata.page.format);
	const showHeader = shouldShowResumeHeader(data, pageIndex);
	const mainSections = filterSections(page.main, data);

	return (
		<Page size={pageSize} style={composeStyles(styles.page, pageMinHeightStyle)}>
			<TemplateProvider styles={styles} colors={colors}>
				<View style={styles.layout}>
					{showHeader && (
						<View style={composeStyles(styles.sidebarColumn, { width: `${metadata.layout.sidebarWidth}%` })}>
							<View style={styles.headerIdentity}>
								<LetterHeader
									styles={{
										headerName: styles.headerName,
										headerText: styles.headerText,
										contactList: styles.contactList,
										contactItem: styles.contactItem,
									}}
									iconColor={colors.background}
								/>
							</View>
						</View>
					)}

					<View style={composeStyles(styles.mainColumn, { rowGap: metrics.sectionGap })}>
						{mainSections.map((section) => (
							<Section key={section} section={section} placement="main" />
						))}
					</View>
				</View>
			</TemplateProvider>
		</Page>
	);
};

const useEspeonTemplate = (): EspeonTemplate => {
	const { picture, metadata, rtl } = useRender();

	return useMemo(() => {
		const r = createRtlStyleHelpers(rtl);
		const foreground = rgbaStringToHex(metadata.design.colors.text);
		const background = rgbaStringToHex(metadata.design.colors.background);
		const primary = rgbaStringToHex(metadata.design.colors.primary);
		const colors: TemplateColorRoles = { foreground, background, primary };
		const metrics = getTemplateMetrics(metadata.page);
		const base = createBaseTemplateStyles({ metadata, foreground, r, metrics, picture });

		const baseStyles = StyleSheet.create({
			...base,
			page: {
				color: foreground,
				backgroundColor: background,
				fontFamily: metadata.typography.body.fontFamily,
				fontSize: metadata.typography.body.fontSize,
				lineHeight: metadata.typography.body.lineHeight,
				direction: r.pageDirection,
			},
			item: {
				rowGap: metrics.gapY(0.125),
			},
			layout: {
				flexDirection: r.row,
				minHeight: "100%",
			},
			sidebarColumn: {
				flexShrink: 0,
				backgroundColor: primary,
				paddingHorizontal: metrics.page.paddingHorizontal,
				paddingVertical: metrics.page.paddingVertical,
			},
			mainColumn: {
				flex: 1,
				paddingHorizontal: metrics.page.paddingHorizontal,
				paddingVertical: metrics.page.paddingVertical,
			},
			headerIdentity: {
				rowGap: metrics.gapY(0.35),
			},
			headerName: {
				color: background,
				fontSize: metadata.typography.heading.fontSize * 1.3,
				lineHeight: headerNameLineHeight,
			},
			headerText: {
				color: background,
			},
			contactList: {
				rowGap: metrics.gapY(0.25),
				paddingTop: metrics.gapY(0.5),
			},
			contactItem: {
				flexDirection: r.row,
				alignItems: "center",
				columnGap: metrics.gapX(1 / 6),
			},
		});

		const accentFor = ({ colors }: TemplateStyleContext) => colors.primary;

		return {
			colors,
			styles: {
				...baseStyles,
				icon: (context) => ({
					display: metadata.page.hideIcons ? "none" : "flex",
					size: metadata.typography.body.fontSize,
					color: accentFor(context),
				}),
			} satisfies EspeonStyles,
		};
	}, [picture, metadata, rtl]);
};
