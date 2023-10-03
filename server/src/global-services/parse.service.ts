import { Injectable } from "@nestjs/common";

@Injectable()
export class ParseService {
	parse(content: string) {
		const arrOfStrings = content.split("\n").filter((line) => line.trim() !== "");
		return arrOfStrings;
	}
}
