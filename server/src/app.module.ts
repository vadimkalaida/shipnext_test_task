import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { ExchangeOfficeModule } from "./exchange-office/exchange-office.module";
import { HelpersService } from './helpers/helpers.service';

@Module({
	imports: [
		ExchangeOfficeModule,
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: `.env.${process.env.NODE_ENV}`,
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				type: "postgres",
				host: configService.get("DB_HOST"),
				port: configService.get("DB_PORT"),
				username: configService.get("DB_USERNAME"),
				password: configService.get("DB_PASSWORD"),
				database: configService.get("DB_NAME"),
				synchronize: true,
				entities: [join(__dirname, "**", "*.entity.{ts,js}")],
			}),
			inject: [ConfigService],
		}),
	],
	controllers: [],
	providers: [HelpersService],
})
export class AppModule {}
