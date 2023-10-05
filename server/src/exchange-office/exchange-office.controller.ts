import { Controller, HttpException, HttpStatus, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import { ExchangeOfficeService } from "./exchange-office.service";
import { FileService } from "./services/file.service";
import { ParseService } from "./services/parse.service";
import { fileMulterConfig } from "./configs/multer.config";

@Controller("exchange-office")
export class ExchangeOfficeController {
	constructor(
		private readonly exchangeOfficeService: ExchangeOfficeService,
		private readonly fileService: FileService,
		private readonly parseService: ParseService
	) {}

	@Post("upload-file")
	@UseInterceptors(FileInterceptor("file", fileMulterConfig))
	async uploadFile(@UploadedFile() file: Express.Multer.File) {
		try {
			const preparedFileString = await this.fileService.uploadFile(file.path);
			const parsed = this.parseService.parse(preparedFileString);
			await this.exchangeOfficeService.saveDataToDB(parsed);
			console.log(parsed, "parsed");
			// console.log(parsed["exchange-offices"][0].exchanges, "parsed[0].exchanges");
			// console.log(parsed["exchange-offices"][0].rates, "parsed[0].rates");
		} catch (e) {
			console.error(e);
			throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
