import type { CoverLetterPartType, CustomSection, ResumeData } from "@reactive-resume/schema/resume/data";
import { getResumeExportData } from "./export-sections";

// A cover letter is prose with fill-in-the-blank placeholders, not itemized fields like a resume —
// starting from an empty rich-text box (or a fictional finished example) gives no structure to work
// from. This seeds a properly structured letter (recipient block, subject line, salutation, body
// paragraphs, closing, signature) with bracketed placeholders (company name, role, key skills, ...)
// instead, matching how real-world cover letter templates work. Each structural part is its own
// item so it can be individually edited, reordered, or hidden in the builder — the same way any
// other section's items already work. Shared between the API (actual document creation) and the
// web app (template/preset preview tiles) so what a preview shows always matches what creating from
// it actually produces.

export type CoverLetterPlaceholderPart = { partType: CoverLetterPartType; content: string };

const COVER_LETTER_PLACEHOLDER_PARTS_EN: CoverLetterPlaceholderPart[] = [
	{
		partType: "recipient",
		content: "<p>[Recipient's name]<br />[Company name]<br />[Company address]<br />[Recipient's email]</p>",
	},
	{ partType: "subject", content: "<p>Subject: Application for the [job title] position</p>" },
	{ partType: "salutation", content: "<p>Dear [Recipient's name or Hiring Manager],</p>" },
	{
		partType: "paragraph",
		content:
			"<p>I am writing to apply for the [job title] position at [company name], which I found on [where you saw the listing]. [One sentence summarizing your profile and why you're a strong fit.]</p>",
	},
	{
		partType: "paragraph",
		content:
			"<p>With [number] years of experience in [your field], I have developed strong skills in [key skill 1], [key skill 2], and [key skill 3]. [Describe a concrete achievement or experience relevant to this role.]</p>",
	},
	{
		partType: "paragraph",
		content:
			"<p>[Company name] stands out to me because of [what draws you to this company — its mission, projects, or reputation], which aligns closely with my own professional goals. I am confident my background would let me contribute to [a goal or project of the company].</p>",
	},
	{
		partType: "closing",
		content:
			"<p>I would welcome the opportunity to discuss my application further. Thank you for considering my candidacy.</p>",
	},
	{ partType: "signature", content: "<p>Sincerely,<br />[Your name]</p>" },
];

const COVER_LETTER_PLACEHOLDER_PARTS_FR: CoverLetterPlaceholderPart[] = [
	{
		partType: "recipient",
		content:
			"<p>[Nom du destinataire]<br />[Nom de l'entreprise]<br />[Adresse de l'entreprise]<br />[Email du destinataire]</p>",
	},
	{ partType: "subject", content: "<p>Objet : Candidature pour le poste de [intitulé du poste]</p>" },
	{ partType: "salutation", content: "<p>Madame, Monsieur,</p>" },
	{
		partType: "paragraph",
		content:
			"<p>Je vous adresse ma candidature pour le poste de [intitulé du poste] au sein de [nom de l'entreprise], découvert [source de l'offre : site de l'entreprise, annonce, recommandation...]. [Une phrase résumant votre profil et votre motivation pour ce poste.]</p>",
	},
	{
		partType: "paragraph",
		content:
			"<p>Fort(e) de [nombre] années d'expérience en [votre domaine], j'ai développé des compétences solides en [compétence clé 1], [compétence clé 2] et [compétence clé 3]. [Décrivez ici une réalisation concrète ou une expérience pertinente pour ce poste.]</p>",
	},
	{
		partType: "paragraph",
		content:
			"<p>[Nom de l'entreprise] se distingue par [ce qui vous attire chez cette entreprise : ses valeurs, ses projets, sa réputation...], ce qui correspond parfaitement à mes aspirations professionnelles. Je suis convaincu(e) que mon profil saurait contribuer à [un objectif ou projet de l'entreprise].</p>",
	},
	{
		partType: "closing",
		content:
			"<p>Je me tiens à votre disposition pour un entretien afin de vous exposer plus en détail ma motivation. Je vous remercie de l'attention portée à ma candidature et vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.</p>",
	},
	{ partType: "signature", content: "<p>[Votre nom]</p>" },
];

export function getCoverLetterPlaceholderParts(locale?: string): CoverLetterPlaceholderPart[] {
	return locale === "fr-FR" ? COVER_LETTER_PLACEHOLDER_PARTS_FR : COVER_LETTER_PLACEHOLDER_PARTS_EN;
}

/**
 * Replaces any existing cover-letter custom section in `data` with a fresh one seeded from the
 * fill-in-the-blank placeholder template — one item per structural part. `generateId` is injected
 * rather than imported so this package doesn't need to depend on `@reactive-resume/utils` for a
 * single string helper.
 */
export function withPlaceholderCoverLetter(
	data: ResumeData,
	locale: string | undefined,
	generateId: () => string,
): ResumeData {
	const parts = getCoverLetterPlaceholderParts(locale);

	const section: CustomSection = {
		id: generateId(),
		type: "cover-letter",
		title: "",
		icon: "",
		columns: 1,
		hidden: false,
		keepTogether: false,
		startOnNewPage: false,
		items: parts.map((part) => ({ id: generateId(), hidden: false, ...part })),
	};

	const withoutExistingCoverLetter = data.customSections.filter((existing) => existing.type !== "cover-letter");

	return { ...data, customSections: [...withoutExistingCoverLetter, section] };
}

/** `withPlaceholderCoverLetter` followed by collapsing the layout down to the letter-only view. */
export function buildPlaceholderCoverLetterData(
	data: ResumeData,
	locale: string | undefined,
	generateId: () => string,
): ResumeData {
	return getResumeExportData(withPlaceholderCoverLetter(data, locale, generateId), "cover-letter");
}
