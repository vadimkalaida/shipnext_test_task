import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { ExchangeOffice } from "./entities/exchange-office.entity";
import { Exchange } from "./entities/exchange.entity";
import { Rate } from "./entities/rate.entity";
import { Country } from "./entities/country.entity";

@Injectable()
export class ExchangeOfficeService {
	constructor(
		@InjectRepository(ExchangeOffice) private readonly exchangeOfficeRepository: Repository<ExchangeOffice>,
		@InjectRepository(Exchange) private readonly exchangeRepository: Repository<Exchange>,
		@InjectRepository(Rate) private readonly rateRepository: Repository<Rate>,
		@InjectRepository(Country) private readonly countryRepository: Repository<Country>
	) {}

	async saveCountriesToDB(countries: Country[]): Promise<void> {
		const codes = countries.map((country) => country.code);
		if (codes.length) {
			const existingCountries = await this.countryRepository.find({
				where: {
					code: In(codes),
				},
			});
			const existingCodes = existingCountries.map((country) => country.code);
			const filteredCountries = countries.filter((country) => country.code && !existingCodes.includes(country.code));
			if (filteredCountries.length) {
				const countryEntities = this.countryRepository.create(filteredCountries);
				await this.countryRepository.save(countryEntities);
			}
		}
	}

	async saveDataToDB(data: NonNullable<unknown>): Promise<void> {
		const { countries } = data as {
			countries: Country[];
		};

		console.log(countries, "countries");
		await this.saveCountriesToDB(countries);

		// await this.countryRepository.save(countries);
		// await this.exchangeOfficeRepository.save(exchangeOffices);
		// await this.exchangeRepository.save(exchanges);
		// await this.rateRepository.save(rates);
	}
}
