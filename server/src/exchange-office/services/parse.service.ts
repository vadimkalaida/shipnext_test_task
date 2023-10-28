import { Injectable } from "@nestjs/common";
import { splitTextByOneOfSymbols } from "../../helpers/splitTextByOneOfSymbols";
import { checkIfContainsOneOfSymbols } from "../../helpers/checkIfContainsOneOfSymbols";

interface IStringWithNumberOfTabs {
	value: string;
	tabs: number;
}

@Injectable()
export class ParseService {
	private readonly KEY_VALUE_DIVIDERS = ["=", ":"];

	private returnResultWithArray(
		res: Record<string, any>,
		currentString: IStringWithNumberOfTabs,
		prevString: IStringWithNumberOfTabs,
		nextString: IStringWithNumberOfTabs
	): Record<string, any> {
		const resultCopy = { ...res };
		const isNextStringContainsDivider = checkIfContainsOneOfSymbols(nextString.value, this.KEY_VALUE_DIVIDERS);
		if (
			isNextStringContainsDivider &&
			!checkIfContainsOneOfSymbols(prevString?.value || this.KEY_VALUE_DIVIDERS[0], this.KEY_VALUE_DIVIDERS)
		) {
			resultCopy[prevString.value] = [];
		} else if (!isNextStringContainsDivider) {
			resultCopy[currentString.value] = [];
		}
		return resultCopy;
	}

	prepareData(stringsWithTabs: IStringWithNumberOfTabs[], tabs: number = 0, customInitialIterationIndex: number = 0) {
		let res: Record<string, any> = {};
		let stringsWithTabsCopy = [...stringsWithTabs];
		let i = customInitialIterationIndex || 0;
		while (i < stringsWithTabsCopy.length) {
			const prevString = stringsWithTabsCopy[i - 1];
			const currentString = stringsWithTabsCopy[i];
			const nextString = stringsWithTabsCopy[i + 1];
			if (currentString && currentString.tabs >= tabs) {
				const isCurrenStringContainsDivider = checkIfContainsOneOfSymbols(currentString.value, this.KEY_VALUE_DIVIDERS);
				if (!isCurrenStringContainsDivider && nextString && !Array.isArray(res[prevString?.value])) {
					res = this.returnResultWithArray(res, currentString, prevString, nextString);
				}
				if (prevString && Array.isArray(res[prevString.value]) && !isCurrenStringContainsDivider) {
					const foundNextItemWithThisTabNumber = stringsWithTabsCopy
						.slice(i + 1)
						.find((item) => item.tabs === currentString.tabs);
					const foundIndex = foundNextItemWithThisTabNumber
						? stringsWithTabsCopy.indexOf(foundNextItemWithThisTabNumber)
						: -1;
					res[prevString.value].push(
						this.prepareData(
							stringsWithTabsCopy.slice(i, foundIndex >= 0 ? foundIndex : stringsWithTabsCopy.length),
							currentString.tabs,
							1
						)
					);
					if (foundNextItemWithThisTabNumber && foundNextItemWithThisTabNumber.value === currentString.value) {
						stringsWithTabsCopy = [stringsWithTabsCopy[i - 1], ...stringsWithTabsCopy.slice(foundIndex)];
					} else {
						stringsWithTabsCopy = stringsWithTabsCopy.slice(
							foundIndex > 0 ? foundIndex - 1 : stringsWithTabsCopy.length
						);
					}
					i = 0;
				}
				if (isCurrenStringContainsDivider) {
					const splitValueArr = splitTextByOneOfSymbols(currentString.value, this.KEY_VALUE_DIVIDERS);
					res[splitValueArr[0].trim()] = splitValueArr[1].trim();
				}
			} else {
				break;
			}
			i += 1;
		}
		return res;
	}

	parse(content: string) {
		const arrOfStrings = content.split("\n").filter((line: string): boolean => line.trim() !== "");
		const stringsWithNumberOfTabs = arrOfStrings.map((line: string): IStringWithNumberOfTabs => {
			const numberOfTabs = line.split("  ").length - 1;
			return {
				value: line.trim(),
				tabs: numberOfTabs,
			};
		});
		return this.prepareData(stringsWithNumberOfTabs);
	}
}
