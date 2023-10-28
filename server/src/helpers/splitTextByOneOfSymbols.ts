export const splitTextByOneOfSymbols = (text: string, symbols: string[], byOnlyOne: boolean = true): string[] => {
	if (byOnlyOne) {
		const foundSymbol = symbols.find((symbol) => text.includes(symbol));
		return foundSymbol ? text.split(foundSymbol) : [];
	}
	return text ? text.split(new RegExp(`[${symbols.join("|")}]`)) : [];
};
