import { Injectable } from "@nestjs/common";

interface IStringWithNumberOfTabs {
	value: string;
	tabs: number;
}

@Injectable()
export class ParseService {
	prepareData(stringsWithTabs: IStringWithNumberOfTabs[], tabs: number = 0, customInitialIterationIndex: number = 0) {
		const res: Record<string, any> = {};
		let stringsWithTabsCopy = [...stringsWithTabs];
		let i = customInitialIterationIndex || 0;
		while (i < stringsWithTabsCopy.length) {
			const prevString = stringsWithTabsCopy[i - 1];
			const currentString = stringsWithTabsCopy[i];
			const nextString = stringsWithTabsCopy[i + 1];
			console.log(prevString, "prevString", i - 1);
			console.log(currentString, "currentString", i);
			console.log(nextString, "nextString", i + 1);
			if (currentString && currentString.tabs >= tabs) {
				if (
					nextString &&
					!currentString.value.includes("=") &&
					!nextString.value.includes("=") &&
					nextString.tabs > currentString.tabs &&
					(!prevString || (prevString && !Array.isArray(res[prevString.value])))
				) {
					console.log("creating error currentstring value", currentString.value);
					res[currentString.value] = [];
				}
				if (
					prevString &&
					!prevString.value.includes("=") &&
					!currentString.value.includes("=") &&
					prevString.tabs < currentString.tabs &&
					!res[prevString.value] &&
					(!nextString || (nextString && nextString.value.includes("=")))
				) {
					console.log("creating error prevstring value", prevString.value);
					res[prevString.value] = [];
				}
				if (
					prevString &&
					Array.isArray(res[prevString.value]) &&
					((nextString && !nextString.value.includes("=")) || !nextString) &&
					!currentString.value.includes("=")
				) {
					console.log("pushing to array", currentString.value);
					const foundNextItemWithThisTab = stringsWithTabsCopy
						.slice(i + 1)
						.find((item) => item.tabs === currentString.tabs);
					console.log(foundNextItemWithThisTab, "foundNextItemWithThisTab");
					const foundIndex = foundNextItemWithThisTab ? stringsWithTabsCopy.indexOf(foundNextItemWithThisTab) : -1;
					res[prevString.value].push(
						this.prepareData(
							stringsWithTabsCopy.slice(i || 0, foundIndex >= 0 ? foundIndex : stringsWithTabsCopy.length),
							currentString.tabs,
							1
						)
					);
					stringsWithTabsCopy = [
						...stringsWithTabsCopy.slice(foundIndex >= 0 ? foundIndex : stringsWithTabsCopy.length),
					];
					console.log(stringsWithTabsCopy, "stringsWithTabsCopy pushing to aray");
					i = 0;
				}
				if (
					prevString &&
					Array.isArray(res[prevString.value]) &&
					nextString &&
					nextString.value.includes("=") &&
					!currentString.value.includes("=")
				) {
					const foundNextItemWithThisTab = stringsWithTabsCopy
						.slice(i + 1)
						.find((item) => item.tabs === currentString.tabs);
					console.log(foundNextItemWithThisTab, "foundNextItemWithThisTab");
					const foundIndex = foundNextItemWithThisTab ? stringsWithTabsCopy.indexOf(foundNextItemWithThisTab) : -1;
					res[prevString.value].push(
						this.prepareData(
							stringsWithTabsCopy.slice(i || 0, foundIndex >= 0 ? foundIndex : stringsWithTabsCopy.length),
							currentString.tabs,
							1
						)
					);
					console.log(stringsWithTabsCopy[i], "stringsWithTabsCopy[i]");
					if (foundNextItemWithThisTab && foundNextItemWithThisTab.value === currentString.value) {
						stringsWithTabsCopy = [
							stringsWithTabsCopy[i - 1],
							...stringsWithTabsCopy.slice(foundIndex >= 0 ? foundIndex : stringsWithTabsCopy.length),
						];
					} else {
						stringsWithTabsCopy = [
							...stringsWithTabsCopy.slice(foundIndex > 0 ? foundIndex - 1 : stringsWithTabsCopy.length),
						];
					}
					i = 0;
					console.log(i, "i", "foundIndex", foundIndex);
				}
				if (currentString.value.includes("=")) {
					const splitValueArr = currentString.value.split("=");
					res[splitValueArr[0].trim()] = splitValueArr[1].trim();
				}
			} else {
				console.log(currentString, "currentString foundSmallerTab");
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
		const prepared = this.prepareData(stringsWithNumberOfTabs);
		console.log(prepared);
		console.log(prepared["exchange-offices"], "prepared[exchange-offices]");
		console.log(prepared["exchange-offices"][0]?.exchanges, "prepared[exchange-offices][0].exchanges");
		console.log(prepared["exchange-offices"][0]?.rates, "prepared[exchange-offices][0].rates");
		console.log(prepared["exchange-offices"][1]?.exchanges, "prepared[exchange-offices][1].exchanges");
		console.log(prepared["exchange-offices"][1]?.rates, "prepared[exchange-offices][1].rates");
		console.log(prepared["exchange-offices"][2], "prepared[exchange-offices][2]");
		console.log(prepared["exchange-offices"][2]?.rates, "prepared[exchange-offices][2].rates");
		return stringsWithNumberOfTabs;
	}
}
