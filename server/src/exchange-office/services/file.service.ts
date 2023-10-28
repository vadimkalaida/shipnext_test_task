import { Injectable } from "@nestjs/common";
import { join, extname } from "path";
import { readFile } from "fs/promises";

@Injectable()
export class FileService {
	constructor() {}

	async uploadFile(filePath: string): Promise<string> {
		const fileExtension = extname(filePath).replace(".", "");
		const preparedFilePath = join(__dirname, "..", "..", "..", filePath);
		return this[fileExtension](preparedFilePath);
	}

	async txt(filePath: string): Promise<string> {
		return readFile(filePath, "utf-8");
	}
}
