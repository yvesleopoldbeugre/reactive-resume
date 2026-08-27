import type { Style } from "@react-pdf/types";
import type { Skin } from "@reactive-resume/schema/resume/skin";
import type { TemplatePageProps } from "../../document";
import type { TemplateColorRoles, TemplateFeatures, TemplateStyleContext, TemplateStyleSlots } from "../shared/types";
import { useMemo } from "react";
import { defaultSkin } from "@reactive-resume/schema/resume/skin";
import { Image, Page, StyleSheet, View } from "#react-pdf-renderer";
import { useRender } from "../../context";
import { createBaseTemplateStyles } from "../shared/base-template-styles";
import { interleaveStackedSections } from "../shared/columns";
import {
	CustomFieldContactItem,
	EmailContactItem,
	LocationContactItem,
	PhoneContactItem,
	WebsiteContactItem,
} from "../shared/contact-item";
import { TemplateProvider } from "../shared/context";
import { shouldShowResumeHeader } from "../shared/cover-letter";
import { filterSections } from "../shared/filtering";
import { getTemplateMetrics } from "../shared/metrics";
import { getTemplatePageMinHeightStyle, getTemplatePageSize } from "../shared/page-size";
import { hasTemplatePicture } from "../shared/picture";
import { Heading, Text } from "../shared/primitives";
import { createRtlStyleHelpers } from "../shared/rtl";
import { Section } from "../shared/sections";
import { composeStyles, headerNameLineHeight, resolvePlacementColor } from "../shared/styles";
import { resolveCustomSkinColors, resolveCustomSkinFeatures } from "./skin-resolvers";

// The generic "from scratch" template: unlike the 15 built-in templates (each a bespoke
// component), this one page component renders every combination of `metadata.skin` an
// admin can compose in the template-preset studio. See `Skin` for the full axis list.

type CustomStyles = Omit<TemplateStyleSlots, "page"> & {
	page: Style;
	contentRow: Style;
	sidebarColumn: Style;
	mainColumn: Style;
	sectionGroup: Style;
	header: Style;
	picture: Style;
	headerTitle: Style;
	headerIdentity: Style;
	headerName: Style;
	headerContactRow: Style;
	headerContactItem: Style;
};

type CustomTemplate = {
	colors: TemplateColorRoles;
	styles: CustomStyles;
	features: TemplateFeatures;
};

export const CustomPage = ({ page, pageIndex }: TemplatePageProps) => {
	const data = useRender();
	const { metadata } = data;
	const skin = metadata.skin ?? defaultSkin;
	const { colors, styles, features } = useCustomTemplate(skin);
	const metrics = getTemplateMetrics(metadata.page);
	const pageSize = getTemplatePageSize(metadata.page.format);
	const pageMinHeightStyle = getTemplatePageMinHeightStyle(metadata.page.format);
	const showHeader = shouldShowResumeHeader(data, pageIndex);
	const sidebarSections = filterSections(page.sidebar, data);
	const mainSections = filterSections(page.main, data);

	return (
		<Page size={pageSize} style={composeStyles(styles.page, pageMinHeightStyle)}>
			<TemplateProvider styles={styles} colors={colors} features={features}>
				{skin.skeleton === "stacked" ? (
					<StackedLayout
						skin={skin}
						styles={styles}
						metrics={metrics}
						showHeader={showHeader}
						mainSections={mainSections}
						sidebarSections={sidebarSections}
						fullWidth={page.fullWidth}
					/>
				) : (
					<ColumnsLayout
						skin={skin}
						styles={styles}
						metrics={metrics}
						showHeader={showHeader}
						mainSections={mainSections}
						sidebarSections={sidebarSections}
						fullWidth={page.fullWidth}
						sidebarWidth={metadata.layout.sidebarWidth}
					/>
				)}
			</TemplateProvider>
		</Page>
	);
};

type StackedLayoutProps = {
	skin: Skin;
	styles: CustomStyles;
	metrics: ReturnType<typeof getTemplateMetrics>;
	showHeader: boolean;
	mainSections: string[];
	sidebarSections: string[];
	fullWidth: boolean;
};

const StackedLayout = ({
	skin,
	styles,
	metrics,
	showHeader,
	mainSections,
	sidebarSections,
	fullWidth,
}: StackedLayoutProps) => {
	const sections = interleaveStackedSections({ mainSections, sidebarSections, fullWidth });

	return (
		<>
			{showHeader && <CustomHeader skin={skin} styles={styles} />}

			<View style={composeStyles(styles.sectionGroup, { rowGap: metrics.sectionGap })}>
				{sections.map((section) => (
					<Section key={section} section={section} placement="main" />
				))}
			</View>
		</>
	);
};

type ColumnsLayoutProps = {
	skin: Skin;
	styles: CustomStyles;
	metrics: ReturnType<typeof getTemplateMetrics>;
	showHeader: boolean;
	mainSections: string[];
	sidebarSections: string[];
	fullWidth: boolean;
	sidebarWidth: number;
};

const ColumnsLayout = ({
	skin,
	styles,
	metrics,
	showHeader,
	mainSections,
	sidebarSections,
	fullWidth,
	sidebarWidth,
}: ColumnsLayoutProps) => {
	const sidebarColumn = (
		<View
			key="sidebar"
			style={composeStyles(styles.sidebarColumn, {
				flexBasis: `${sidebarWidth}%`,
				display: fullWidth ? "none" : "flex",
				rowGap: metrics.sectionGap,
			})}
		>
			{showHeader && skin.header.placement === "sidebar" && <CustomHeader skin={skin} styles={styles} />}
			{sidebarSections.map((section) => (
				<Section key={section} section={section} placement="sidebar" />
			))}
		</View>
	);

	const mainColumn = (
		<View key="main" style={composeStyles(styles.mainColumn, { flex: 1, rowGap: metrics.sectionGap })}>
			{showHeader && skin.header.placement === "main" && <CustomHeader skin={skin} styles={styles} />}
			{mainSections.map((section) => (
				<Section key={section} section={section} placement="main" />
			))}
		</View>
	);

	const columns = skin.sidebar.position === "before" ? [sidebarColumn, mainColumn] : [mainColumn, sidebarColumn];

	return (
		<>
			{showHeader && skin.header.placement === "full-width" && <CustomHeader skin={skin} styles={styles} />}

			<View style={composeStyles(styles.contentRow, { columnGap: metrics.columnGap })}>{columns}</View>
		</>
	);
};

type CustomHeaderProps = {
	skin: Skin;
	styles: CustomStyles;
};

const CustomHeader = ({ skin, styles }: CustomHeaderProps) => {
	const { basics, picture } = useRender();
	const hasPicture = skin.header.picturePlacement !== "none" && hasTemplatePicture(picture);
	const pictureAtEnd = skin.header.picturePlacement === "inline-end";

	const identity = (
		<View style={styles.headerTitle}>
			<View style={styles.headerIdentity}>
				<Heading style={styles.headerName}>{basics.name}</Heading>
				<Text>{basics.headline}</Text>
			</View>

			<View style={styles.headerContactRow}>
				<EmailContactItem email={basics.email} style={styles.headerContactItem} />
				<PhoneContactItem phone={basics.phone} style={styles.headerContactItem} />
				<LocationContactItem location={basics.location} style={styles.headerContactItem} />
				<WebsiteContactItem website={basics.website} style={styles.headerContactItem} />
				{basics.customFields.map((field) => (
					<CustomFieldContactItem key={field.id} field={field} style={styles.headerContactItem} />
				))}
			</View>
		</View>
	);

	return (
		<View style={styles.header}>
			{hasPicture && !pictureAtEnd && <Image src={picture.url} style={styles.picture} />}
			{identity}
			{hasPicture && pictureAtEnd && <Image src={picture.url} style={styles.picture} />}
		</View>
	);
};

const useCustomTemplate = (skin: Skin): CustomTemplate => {
	const { picture, metadata, rtl } = useRender();

	return useMemo(() => {
		const r = createRtlStyleHelpers(rtl);
		const colors = resolveCustomSkinColors(metadata.design.colors, skin);
		const { foreground, background, primary } = colors;
		const metrics = getTemplateMetrics(metadata.page);
		const base = createBaseTemplateStyles({ metadata, foreground, r, metrics, picture });

		const headerPictureRow =
			skin.header.picturePlacement === "inline-start" || skin.header.picturePlacement === "inline-end";
		const headerAlign = skin.header.align === "center" ? "center" : "flex-start";
		const headerTextAlign = skin.header.align === "center" ? "center" : "left";

		const baseStyles = StyleSheet.create({
			...base,
			page: {
				flexDirection: "column",
				rowGap: metrics.headerGap,
				color: foreground,
				backgroundColor: background,
				paddingHorizontal: metrics.page.paddingHorizontal,
				paddingVertical: metrics.page.paddingVertical,
				fontFamily: metadata.typography.body.fontFamily,
				fontSize: metadata.typography.body.fontSize,
				lineHeight: metadata.typography.body.lineHeight,
				direction: r.pageDirection,
				...(skin.divider === "top-bar" ? { borderTopWidth: metrics.gapY(0.45), borderTopColor: primary } : {}),
			},
			section: {
				flexDirection: "column",
				rowGap: metrics.gapY(0.25),
			},
			sectionHeading: {
				...(skin.heading.decoration === "underline"
					? { borderBottomWidth: 1, paddingBottom: metrics.gapY(0.125) }
					: {}),
				...(skin.heading.decoration === "uppercase" ? { textTransform: "uppercase" } : {}),
				...(skin.heading.decoration === "centered" ? { textAlign: "center" } : {}),
			},
			item: {
				rowGap: metrics.gapY(0.125),
			},
			contentRow: {
				flexDirection: r.row,
			},
			sidebarColumn: {},
			mainColumn: {},
			sectionGroup: {},
			header: {
				flexDirection: headerPictureRow ? r.row : "column",
				alignItems: headerAlign,
				columnGap: metrics.gapX(0.5),
				rowGap: metrics.gapY(0.5),
			},
			headerTitle: {
				alignItems: headerAlign,
				textAlign: headerTextAlign,
				rowGap: metrics.gapY(0.5),
				...(headerPictureRow ? { flex: 1 } : {}),
			},
			headerIdentity: {
				alignItems: headerAlign,
				textAlign: headerTextAlign,
				rowGap: metrics.gapY(0.35),
			},
			headerName: {
				fontSize: metadata.typography.heading.fontSize * 1.5,
				lineHeight: headerNameLineHeight,
			},
			headerContactRow: {
				justifyContent: headerAlign === "center" ? "center" : "flex-start",
				flexDirection: r.row,
				flexWrap: "wrap",
				rowGap: metrics.gapY(0.125),
				columnGap: metrics.gapX(0.5),
			},
			headerContactItem: {
				flexDirection: r.row,
				alignItems: "center",
				columnGap: metrics.gapX(1 / 6),
			},
		});

		const foregroundFor = ({ placement, colors }: TemplateStyleContext) =>
			resolvePlacementColor({
				placement,
				defaultForeground: colors.foreground,
				sidebarForeground: colors.sidebarForeground,
			});

		const accentFor = ({ placement, colors }: TemplateStyleContext) =>
			resolvePlacementColor({
				placement,
				defaultForeground: colors.primary,
				sidebarForeground: colors.sidebarForeground,
			});

		const features = resolveCustomSkinFeatures(skin);

		return {
			colors,
			features,
			styles: {
				...baseStyles,
				text: (context) => ({ ...baseStyles.text, color: foregroundFor(context) }),
				heading: (context) => ({ ...baseStyles.heading, color: foregroundFor(context) }),
				link: (context) => ({ ...baseStyles.link, color: foregroundFor(context) }),
				richParagraph: (context) => ({ ...baseStyles.richParagraph, color: foregroundFor(context) }),
				richListItemMarker: (context) => ({ ...baseStyles.richListItemMarker, color: foregroundFor(context) }),
				richListItemContent: (context) => ({ ...baseStyles.richListItemContent, color: foregroundFor(context) }),
				sectionHeading: (context) => ({
					...baseStyles.sectionHeading,
					color: accentFor(context),
					...(skin.heading.decoration === "underline" ? { borderBottomColor: accentFor(context) } : {}),
				}),
				sectionItemHeader: (context) =>
					skin.divider === "left-border" && context.placement === "main"
						? {
								borderLeftWidth: 2,
								borderLeftColor: accentFor(context),
								paddingLeft: metrics.gapX(0.5),
								paddingVertical: metrics.gapY(0.125),
								marginLeft: -metrics.gapX(0.625),
							}
						: {},
				levelItem: (context) => ({ borderColor: accentFor(context) }),
				levelItemActive: (context) => ({ backgroundColor: accentFor(context) }),
				icon: (context) => ({
					display: metadata.page.hideIcons ? "none" : "flex",
					size: metadata.typography.body.fontSize,
					color: accentFor(context),
				}),
			} satisfies CustomStyles,
		};
	}, [picture, metadata, rtl, skin]);
};
