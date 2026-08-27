import type { Style } from "@react-pdf/types";
import { View } from "#react-pdf-renderer";
import { useRender } from "../../context";
import {
	CustomFieldContactItem,
	EmailContactItem,
	LocationContactItem,
	PhoneContactItem,
	WebsiteContactItem,
} from "./contact-item";
import { Heading, Text } from "./primitives";

export type LetterHeaderStyles = {
	headerName: Style;
	headerText?: Style;
	contactList: Style;
	contactItem: Style;
};

type LetterHeaderProps = {
	styles: LetterHeaderStyles;
	iconColor?: string;
};

/**
 * Sender identity block (name, headline, contact list) — the same fields every CV template's
 * own header already renders, factored out here since the dedicated cover-letter templates
 * render nothing else in their header (no picture, no CV sections, always one column).
 */
export const LetterHeader = ({ styles, iconColor }: LetterHeaderProps) => {
	const { basics } = useRender();

	const textStyleProps = styles.headerText ? { textStyle: styles.headerText } : {};
	const iconColorProps = iconColor ? { iconColor } : {};

	return (
		<>
			<Heading style={styles.headerName}>{basics.name}</Heading>
			{basics.headline && <Text {...(styles.headerText ? { style: styles.headerText } : {})}>{basics.headline}</Text>}

			<View style={styles.contactList}>
				<EmailContactItem email={basics.email} style={styles.contactItem} {...textStyleProps} {...iconColorProps} />
				<PhoneContactItem phone={basics.phone} style={styles.contactItem} {...textStyleProps} {...iconColorProps} />
				<LocationContactItem
					location={basics.location}
					style={styles.contactItem}
					{...textStyleProps}
					{...iconColorProps}
				/>
				<WebsiteContactItem
					website={basics.website}
					style={styles.contactItem}
					{...textStyleProps}
					{...iconColorProps}
				/>
				{basics.customFields.map((field) => (
					<CustomFieldContactItem
						key={field.id}
						field={field}
						style={styles.contactItem}
						{...textStyleProps}
						{...iconColorProps}
					/>
				))}
			</View>
		</>
	);
};
