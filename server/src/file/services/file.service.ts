import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { join, extname } from "path";
import { ReadFileService } from "./read-file.service";
import { ParseService } from "../../global-services/parse.service";

@Injectable()
export class FileService {
	constructor(private readonly readFileService: ReadFileService) {}

	async uploadFile(filePath: string): Promise<string> {
		const fileExtension = extname(filePath).replace(".", "");
		const preparedFilePath = join(__dirname, "..", "..", "..", filePath);
		return this.readFileService[fileExtension](preparedFilePath);
	}
}
