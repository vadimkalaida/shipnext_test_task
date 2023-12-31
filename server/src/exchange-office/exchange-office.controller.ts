import { Controller, Get, HttpException, HttpStatus, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
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
			const preparedFileString = await this.fileService.uploadFile(file);
			const parsed = this.parseService.parse(preparedFileString);
			await this.exchangeOfficeService.saveDataToDB(parsed);
			return parsed;
		} catch (e) {
			console.error(e);
			throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@Get("top-currency-exchangers")
	async getTop3CurrencyExchangers() {
		try {
			return await this.exchangeOfficeService.getTopCurrencyExchangers();
		} catch (e) {
			console.error(e);
			throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
