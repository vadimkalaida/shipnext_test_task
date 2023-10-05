import { Injectable } from "@nestjs/common";
import { join, extname } from "path";
import { ReadFileService } from "./read-file.service";

@Injectable()
export class FileService {
	constructor(private readonly readFileService: ReadFileService) {}

	async uploadFile(filePath: string): Promise<string> {
		const fileExtension = extname(filePath).replace(".", "");
		const preparedFilePath = join(__dirname, "..", "..", "..", filePath);
		return this.readFileService[fileExtension](preparedFilePath);
	}
}
