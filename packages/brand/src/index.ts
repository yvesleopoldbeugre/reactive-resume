/**
 * Single source of truth for product branding. `url` and `supportEmail` are provisional
 * until the production domain and mailbox are finalized — update here once confirmed.
 */
export const BRAND = {
	name: "Essor",
	tagline: "Un CV qui prend son envol",
	description:
		"Essor est un créateur de CV moderne qui vous aide à construire, personnaliser et partager un CV et une lettre de motivation professionnels en quelques minutes.",
	url: "https://essor.cv",
	supportEmail: "bonjour@essor.cv",
} as const;

/**
 * Essor is built on top of Reactive Resume (MIT). This upstream reference is kept
 * for license attribution only — it is not Essor's own repository.
 */
export const UPSTREAM = {
	name: "Reactive Resume",
	repoUrl: "https://github.com/amruthpillai/reactive-resume",
	licenseUrl: "https://github.com/amruthpillai/reactive-resume/blob/main/LICENSE",
	author: "Amruth Pillai",
} as const;
