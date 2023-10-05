import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Country } from "./entities/country.entity";
import { Rate } from "./entities/rate.entity";
import { Exchange } from "./entities/exchange.entity";
import { ExchangeOffice } from "./entities/exchange-office.entity";
import { ExchangeOfficeController } from "./exchange-office.controller";
import { ExchangeOfficeService } from "./exchange-office.service";
import { FileService } from "./services/file.service";
import { ParseService } from "./services/parse.service";
import { ReadFileService } from "./services/read-file.service";

@Module({
	imports: [TypeOrmModule.forFeature([Country, Rate, Exchange, ExchangeOffice])],
	controllers: [ExchangeOfficeController],
	providers: [ExchangeOfficeService, FileService, ReadFileService, ParseService],
})
export class ExchangeOfficeModule {}
