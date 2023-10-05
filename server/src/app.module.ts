import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileModule } from "./file/file.module";

@Module({
	imports: [
		FileModule,
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
				database: configService.get("DB_DATABASE"),
				synchronize: true,
				entities: [__dirname, "/**/*.entity{.ts,.js}"],
			}),
			inject: [ConfigService],
		}),
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
