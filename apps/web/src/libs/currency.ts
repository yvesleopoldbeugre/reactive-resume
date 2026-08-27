/** Formats a whole-unit XOF (West African CFA franc) amount for display, e.g. `2500` -> "2 500 FCFA". */
export function formatXof(amount: number) {
	return `${new Intl.NumberFormat("fr-FR").format(amount)} FCFA`;
}
