export const checkIfContainsOneOfSymbols = (text: string, symbols: string[]): boolean => {
	return text && symbols.some((symbol) => text.includes(symbol));
};
