import { BRAND } from "@reactive-resume/brand";

const productionRootUrl = `${BRAND.url}/`;
const appName = BRAND.name;

type JsonLd = Record<string, unknown>;

export const getCanonicalRootUrl = (origin?: string): string => {
	if (!origin) return productionRootUrl;

	const url = new URL(origin);
	url.pathname = "/";
	url.search = "";
	url.hash = "";

	return url.toString();
};

export const createNoindexFollowMeta = () => ({ name: "robots", content: "noindex, follow" });

type ResumeSocialMetaOptions = {
	canonicalUrl: string;
	title: string;
	description: string;
	imageUrl: string;
};

export const createResumeSocialMeta = ({ canonicalUrl, title, description, imageUrl }: ResumeSocialMetaOptions) => [
	{ property: "og:type", content: "profile" },
	{ property: "og:title", content: title },
	{ property: "og:description", content: description },
	{ property: "og:url", content: canonicalUrl },
	{ property: "og:image", content: imageUrl },
	{ property: "twitter:card", content: "summary_large_image" },
	{ property: "twitter:title", content: title },
	{ property: "twitter:description", content: description },
	{ property: "twitter:image", content: imageUrl },
];

const serializeJsonLdForScript = (data: JsonLd) =>
	JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (character) => {
		switch (character) {
			case "<":
				return "\\u003C";
			case ">":
				return "\\u003E";
			case "&":
				return "\\u0026";
			case "\u2028":
				return "\\u2028";
			case "\u2029":
				return "\\u2029";
			default:
				return character;
		}
	});

const createStructuredDataScript = (id: string, data: JsonLd) => ({
	id,
	type: "application/ld+json",
	children: serializeJsonLdForScript(data),
});

export const getRootStructuredData = (canonicalUrl: string): JsonLd[] => [
	{
		"@type": "WebSite",
		name: appName,
		url: canonicalUrl,
	},
	{
		"@type": ["SoftwareApplication", "WebApplication"],
		name: appName,
		url: canonicalUrl,
		description: BRAND.description,
		applicationCategory: "BusinessApplication",
		operatingSystem: "Web",
	},
	{
		"@type": "FAQPage",
		mainEntity: homeFaqJsonLdItems.map((item) => ({
			"@type": "Question",
			name: item.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: item.answer,
			},
		})),
	},
];

export const createRootStructuredDataScript = (canonicalUrl: string) =>
	createStructuredDataScript("essor-structured-data", {
		"@context": "https://schema.org",
		"@graph": getRootStructuredData(canonicalUrl),
	});

const homeFaqJsonLdItems = [
	{
		question: "Comment mes données sont-elles protégées ?",
		answer:
			"Vos données sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers. Vous gardez le contrôle total sur votre CV et vos informations.",
	},
	{
		question: "Puis-je exporter mon CV en PDF ?",
		answer:
			"Absolument ! Vous pouvez exporter votre CV en PDF en un clic. Le PDF exporté conserve parfaitement toute votre mise en forme.",
	},
	{
		question: "Puis-je aussi créer une lettre de motivation ?",
		answer:
			"Oui ! Les lettres de motivation sont gérées comme des documents à part entière, séparés de vos CV, avec les mêmes modèles, couleurs et options d'export.",
	},
	{
		question: `${appName} est-il disponible en plusieurs langues ?`,
		answer: `Oui, ${appName} est disponible en plusieurs langues. Vous pouvez choisir votre langue préférée dans les paramètres, ou via le sélecteur de langue en haut à droite.`,
	},
	{
		question: `Qu'est-ce qui distingue ${appName} des autres créateurs de CV ?`,
		answer: `${appName} est simple, rapide et pensé pour vous aider à décrocher un entretien : modèles soignés, personnalisation complète et export PDF impeccable, sans publicité ni suivi intrusif.`,
	},
	{
		question: "Comment partager mon CV ?",
		answer:
			"Vous pouvez partager votre CV via une URL publique unique, la protéger par un mot de passe, ou le télécharger en PDF pour le transmettre directement. Le choix est le vôtre !",
	},
] as const;
