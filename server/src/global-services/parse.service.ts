import { Injectable } from "@nestjs/common";

interface IStringWithNumberOfTabs {
	value: string;
	tabs: number;
}

@Injectable()
export class ParseService {
	prepareData(stringsWithTabs: IStringWithNumberOfTabs[], tabs: number = 0, customI: number = 0) {
		const res = {};
		let stringsWithTabsCopy = [...stringsWithTabs];
		let foundSmallerTab = false;
		let i = customI || 0;
		while (!foundSmallerTab && i < stringsWithTabsCopy.length) {
			const currentString = stringsWithTabsCopy[i];
			console.log(currentString, "currentString", i);
			const nextString = stringsWithTabsCopy[i + 1];
			const prevString = stringsWithTabsCopy[i - 1];
			console.log(prevString, "prevString", i - 1);
			if (currentString && currentString.tabs >= tabs) {
				if (
					nextString &&
					!currentString.value.includes("=") &&
					!nextString.value.includes("=") &&
					nextString.tabs > currentString.tabs
				) {
					res[currentString.value] = [];
				}
				if (
					prevString &&
					Array.isArray(res[prevString.value]) &&
					nextString &&
					nextString.value.includes("=") &&
					!currentString.value.includes("=")
				) {
					console.log(currentString, "currentString obj");
					// res[prevString.value].push({
					// 	[nextString.value.split("=")[0].trim()]: nextString.value.split("=")[1].trim(),
					// });
					const foundNextItemWithThisTab = stringsWithTabsCopy
						.slice(i + 1)
						.find((item) => item.tabs === currentString.tabs);
					console.log(foundNextItemWithThisTab, "foundNextItemWithThisTab");
					const foundIndex = foundNextItemWithThisTab ? stringsWithTabsCopy.indexOf(foundNextItemWithThisTab) : -1;
					res[prevString.value].push({
						...this.prepareData(
							stringsWithTabsCopy.slice(i || 0, foundIndex >= -1 ? foundIndex : stringsWithTabsCopy.length - 1),
							currentString.tabs,
							1
						),
					});
					console.log(stringsWithTabsCopy[i], "stringsWithTabsCopy[i]");
					// if (foundNextItemWithThisTab && foundNextItemWithThisTab.value === currentString.value) {
					// 	stringsWithTabsCopy = [
					// 		stringsWithTabsCopy[i - 1],
					// 		...stringsWithTabsCopy.slice(foundIndex > 0 ? foundIndex - 1 : stringsWithTabsCopy.length),
					// 	];
					// } else {
					// 	stringsWithTabsCopy = [
					// 		...stringsWithTabsCopy.slice(foundIndex > 0 ? foundIndex - 1 : stringsWithTabsCopy.length),
					// 	];
					// }
					stringsWithTabsCopy = [
						stringsWithTabsCopy[i - 1],
						...stringsWithTabsCopy.slice(foundIndex >= 0 ? foundIndex : stringsWithTabsCopy.length),
					];
					// i = foundIndex > 0 ? foundIndex - 1 : stringsWithTabsCopy.length - 1;
					i = 0;
					console.log(i, "i", "foundIndex", foundIndex);
				}
				if (currentString.value.includes("=") && ((prevString && prevString.value.includes("=")) || !prevString)) {
					res[currentString.value.split("=")[0].trim()] = currentString.value.split("=")[1].trim();
				}
				// this.prepareData(stringsWithTabs, currentString.tabs);
			} else {
				console.log(currentString, "currentString");
				foundSmallerTab = true;
			}
			if (!foundSmallerTab) {
				i += 1;
			}
		}
		return res;
		// for (let i = 0; i < stringsWithTabs.length && stringsWithTabs[i].tabs > tabs; i += 1) {
		// 	if (
		// 		!stringsWithTabs[i].value.includes("=") &&
		// 		stringsWithTabs[i + 1] &&
		// 		!stringsWithTabs[i + 1].value.includes("=")
		// 	) {
		// 		res[stringsWithTabs[i].value] = [];
		// 	}
		// }
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
		console.log(prepared["exchange-offices"], "prepared exchange-offices");
		console.log(prepared["exchange-offices"][0].exchanges, "prepared exchange-offices[0].exchanges");
		return stringsWithNumberOfTabs;
	}
}
