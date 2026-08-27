import type { Style } from "@react-pdf/types";
import type { TemplatePlacement } from "./styles";

const MIN_SECTION_COLUMNS = 1;
const MAX_SECTION_COLUMNS = 6;

type SectionItemsLayoutInput = {
	columns: unknown;
	rowGap: number;
	columnGap: number;
};

type SectionTimelineInput = {
	sectionTimeline: boolean;
	placement: TemplatePlacement;
	columns: unknown;
};

type SectionItemsLayout = {
	columns: number;
	containerStyle: Style;
	rowStyle: Style | undefined;
	itemStyle: Style | undefined;
	isGrid: boolean;
};

const normalizeSectionColumns = (columns: unknown): number => {
	if (typeof columns !== "number" || !Number.isFinite(columns) || !Number.isInteger(columns))
		return MIN_SECTION_COLUMNS;

	return Math.min(MAX_SECTION_COLUMNS, Math.max(MIN_SECTION_COLUMNS, columns));
};

export const getSectionItemsLayout = ({ columns, rowGap, columnGap }: SectionItemsLayoutInput): SectionItemsLayout => {
	const normalizedColumns = normalizeSectionColumns(columns);

	if (normalizedColumns === 1) {
		return {
			columns: normalizedColumns,
			containerStyle: { rowGap },
			rowStyle: undefined,
			itemStyle: undefined,
			isGrid: false,
		};
	}

	return {
		columns: normalizedColumns,
		containerStyle: { rowGap },
		rowStyle: {
			flexDirection: "row",
			columnGap,
		},
		itemStyle: {
			flexBasis: 0,
			flexGrow: 1,
			flexShrink: 1,
			minWidth: 0,
			maxWidth: "100%",
			overflow: "hidden",
		},
		isGrid: true,
	};
};

export const getSectionItemRows = <T>(items: T[], columns: unknown): T[][] => {
	const normalizedColumns = normalizeSectionColumns(columns);
	const rows: T[][] = [];

	for (let index = 0; index < items.length; index += normalizedColumns) {
		rows.push(items.slice(index, index + normalizedColumns));
	}

	return rows;
};

export const shouldUseSectionTimeline = ({ sectionTimeline, placement, columns }: SectionTimelineInput): boolean => {
	return sectionTimeline && placement === "main" && normalizeSectionColumns(columns) === 1;
};

type InterleaveStackedSectionsInput = {
	mainSections: string[];
	sidebarSections: string[];
	fullWidth: boolean;
};

/**
 * Merges main and sidebar section IDs into a single flat, vertically-stacked order for
 * single-column layouts that have no real sidebar column (e.g. Bronzor, the "stacked" skin
 * skeleton). Alternates sidebar/main pairs by index so both groups stay interleaved rather
 * than one running entirely before the other.
 */
export const interleaveStackedSections = ({
	mainSections,
	sidebarSections,
	fullWidth,
}: InterleaveStackedSectionsInput): string[] => {
	if (fullWidth) return mainSections;

	const sections: string[] = [];
	const sectionCount = Math.max(mainSections.length, sidebarSections.length);

	for (let index = 0; index < sectionCount; index += 1) {
		const sidebarSection = sidebarSections[index];
		const mainSection = mainSections[index];

		if (sidebarSection) sections.push(sidebarSection);
		if (mainSection) sections.push(mainSection);
	}

	return sections;
};
