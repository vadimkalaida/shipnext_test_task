import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { join, extname } from "path";
import { ReadFileService } from "./read-file.service";
import { ParseService } from "../../global-services/parse.service";

@Injectable()
export class FileService {
	constructor(
		private readonly readFileService: ReadFileService,
		private readonly parseService: ParseService
	) {}

	async uploadFile(filePath: string): Promise<void> {
		const fileExtension = extname(filePath).replace(".", "");
		const preparedFilePath = join(__dirname, "..", "..", "..", filePath);
		try {
			const preparedFileContent = await this.readFileService[fileExtension](preparedFilePath);
			const parsed = this.parseService.parse(preparedFileContent);
			console.log(parsed);
		} catch (e) {
			console.error(e);
			throw new HttpException("Something went wrong while reading file", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
