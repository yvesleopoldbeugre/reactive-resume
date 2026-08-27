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

type VulpixStyles = Omit<TemplateStyleSlots, "page"> & {
	page: Style;
	header: Style;
	headerIdentity: Style;
	headerName: Style;
	headerText: Style;
	contactList: Style;
	contactItem: Style;
};

type VulpixTemplate = {
	colors: TemplateColorRoles;
	styles: VulpixStyles;
};

/**
 * A single colored accent rule under the sender's name — the lightest-touch color treatment of
 * the dedicated cover-letter templates. Dedicated to cover letters (see `templateKindMap`):
 * always one flowing column, never a sidebar.
 */
export const VulpixPage = ({ page, pageIndex }: TemplatePageProps) => {
	const data = useRender();
	const { metadata } = data;
	const { colors, styles } = useVulpixTemplate();
	const metrics = getTemplateMetrics(metadata.page);
	const pageSize = getTemplatePageSize(metadata.page.format);
	const pageMinHeightStyle = getTemplatePageMinHeightStyle(metadata.page.format);
	const showHeader = shouldShowResumeHeader(data, pageIndex);
	const mainSections = filterSections(page.main, data);

	return (
		<Page size={pageSize} style={composeStyles(styles.page, pageMinHeightStyle)}>
			<TemplateProvider styles={styles} colors={colors}>
				{showHeader && (
					<View style={styles.header}>
						<View style={styles.headerIdentity}>
							<LetterHeader
								styles={{
									headerName: styles.headerName,
									headerText: styles.headerText,
									contactList: styles.contactList,
									contactItem: styles.contactItem,
								}}
							/>
						</View>
					</View>
				)}

				<View style={{ rowGap: metrics.sectionGap }}>
					{mainSections.map((section) => (
						<Section key={section} section={section} placement="main" />
					))}
				</View>
			</TemplateProvider>
		</Page>
	);
};

const useVulpixTemplate = (): VulpixTemplate => {
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
				paddingHorizontal: metrics.page.paddingHorizontal,
				paddingVertical: metrics.page.paddingVertical,
				rowGap: metrics.sectionGap,
				fontFamily: metadata.typography.body.fontFamily,
				fontSize: metadata.typography.body.fontSize,
				lineHeight: metadata.typography.body.lineHeight,
				direction: r.pageDirection,
			},
			item: {
				rowGap: metrics.gapY(0.125),
			},
			header: {
				rowGap: metrics.gapY(0.5),
				paddingBottom: metrics.page.paddingVertical,
			},
			headerIdentity: {
				rowGap: metrics.gapY(0.35),
				borderBottomWidth: 2,
				borderBottomColor: primary,
				paddingBottom: metrics.gapY(0.5),
			},
			headerName: {
				color: primary,
				fontSize: metadata.typography.heading.fontSize * 1.5,
				lineHeight: headerNameLineHeight,
			},
			headerText: {},
			contactList: {
				flexDirection: r.row,
				flexWrap: "wrap",
				rowGap: metrics.gapY(0.125),
				columnGap: metrics.gapX(0.75),
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
			} satisfies VulpixStyles,
		};
	}, [picture, metadata, rtl]);
};
