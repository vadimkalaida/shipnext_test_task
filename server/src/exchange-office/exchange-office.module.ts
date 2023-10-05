import { Module } from "@nestjs/common";
import { ExchangeOfficeService } from "./exchange-office.service";
import { ExchangeOfficeController } from "./exchange-office.controller";
import { FileService } from "./services/file.service";
import { ParseService } from "./services/parse.service";
import { ReadFileService } from "./services/read-file.service";

@Module({
	controllers: [ExchangeOfficeController],
	providers: [ExchangeOfficeService, FileService, ReadFileService, ParseService],
})
export class ExchangeOfficeModule {}
