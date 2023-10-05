export class TextService {
	static checkIfContainsOneOfSymbols(text: string, symbols: string[]): boolean {
		return text && symbols.some((symbol) => text.includes(symbol));
	}

	static splitTextByOneOfSymbols(text: string, symbols: string[]): string[] {
		return text ? text.split(new RegExp(`[${symbols.join("|")}]`)) : [];
	}
}
