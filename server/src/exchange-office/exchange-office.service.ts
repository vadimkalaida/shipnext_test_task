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

	async saveDataByFieldToDB(
		data: NonNullable<unknown>[],
		repositoryName: string,
		fieldName: string,
		isNumCheck: boolean = false
	): Promise<void> {
		const mappedFields = data.map((item: { [key: string]: any }) => item[fieldName]);
		if (mappedFields.length) {
			const existingDataItems = await this[repositoryName].find({
				where: {
					[fieldName]: In(mappedFields),
				},
			});
			const existingFields = existingDataItems.map((item: { [key: string]: any }) => item[fieldName]);
			const filteredData = data.filter((item: { [key: string]: any }) => {
				if (item[fieldName]) {
					const isNum = isNumCheck ? Number.isFinite(+item[fieldName]) : false;
					return !existingFields.includes(isNum ? +item[fieldName] : item[fieldName]);
				}
				return false;
			});
			await this.saveDataToDb(filteredData, repositoryName);
		}
	}

	async prepareDataWithExchangeOfficeId(
		exchangeOffices: ExchangeOffice[],
		fieldName: string
	): Promise<NonNullable<unknown>[]> {
		const exchangeOfficeIds = exchangeOffices
			.filter((exchangeOffice) => exchangeOffice[fieldName])
			.map((exchangeOfficeItem) => exchangeOfficeItem.id);
		if (exchangeOfficeIds.length) {
			const foundExchangeOffices = await this.exchangeOfficeRepository.find({
				where: {
					id: In(exchangeOfficeIds),
				},
			});
			return foundExchangeOffices.reduce((arr, exchangeOffice) => {
				const foundExchangeOfficeWithThisField = exchangeOffices.find(
					(foundExchangeOfficeItem) =>
						(Number.isFinite(+foundExchangeOfficeItem.id)
							? +foundExchangeOfficeItem.id
							: foundExchangeOfficeItem.id) === exchangeOffice.id
				);
				return [
					...arr,
					...foundExchangeOfficeWithThisField[fieldName].map((dataItem: { [key: string]: any }) => ({
						...dataItem,
						exchangeOffice,
					})),
				];
			}, []);
		}
		return [];
	}

	async saveDataToDb(data: NonNullable<unknown>[], repositoryName: string): Promise<void> {
		if (data.length) {
			const dataEntities = this[repositoryName].create(data);
			await this[repositoryName].save(dataEntities);
		}
	}

	async saveDataToDB(data: NonNullable<unknown>): Promise<void> {
		const exchangeOffices = data["exchange-offices"];
		const { countries } = data as {
			countries: Country[];
		};
		await this.saveDataByFieldToDB(countries, "countryRepository", "code");
		await this.saveDataByFieldToDB(exchangeOffices, "exchangeOfficeRepository", "id", true);
		const [exchanges, rates] = await Promise.all(
			["exchanges", "rates"].map((fieldName) => this.prepareDataWithExchangeOfficeId(exchangeOffices, fieldName))
		);
		await Promise.all(
			[exchanges, rates].map((item, index) => this.saveDataToDb(item, ["exchangeRepository", "rateRepository"][index]))
		);
	}
}
