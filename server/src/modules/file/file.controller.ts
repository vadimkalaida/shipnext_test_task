import { Controller, Post, UploadedFile, UseInterceptors, HttpException, HttpStatus } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import { FileService } from "./services/file.service";
import { fileMulterConfig } from "./configs/multer.config";
import { ParseService } from "../../global-services/parse.service";

@Controller("file")
export class FileController {
	constructor(
		private readonly fileService: FileService,
		private readonly parseService: ParseService
	) {}

	@Post("upload")
	@UseInterceptors(FileInterceptor("file", fileMulterConfig))
	async uploadFile(@UploadedFile() file: Express.Multer.File) {
		try {
			const preparedFileString = await this.fileService.uploadFile(file.path);
			const parsed = this.parseService.parse(preparedFileString);
			console.log(parsed, "parsed");
			console.log(parsed["exchange-offices"][0].exchanges, "parsed[0].exchanges");
			console.log(parsed["exchange-offices"][0].rates, "parsed[0].rates");
		} catch (e) {
			console.error(e);
			throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
