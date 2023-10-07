import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In, MoreThanOrEqual } from "typeorm";
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

	async saveUniqueDataByField(
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
				if (item[fieldName] !== undefined) {
					const isNum = isNumCheck ? Number.isFinite(+item[fieldName]) : false;
					return !existingFields.includes(isNum ? +item[fieldName] : item[fieldName]);
				}
				return false;
			});
			await this.saveEntity(filteredData, repositoryName);
		}
	}

	async prepareDataWithExchangeOffice<T>(parsedExchangeOffices: ExchangeOffice[], fieldName: string): Promise<T[]> {
		const parsedExchangeOfficeIds = parsedExchangeOffices
			.filter((parsedExchangeOffice) => parsedExchangeOffice[fieldName])
			.map((parsedExchangeOffice) => parsedExchangeOffice.id);
		if (parsedExchangeOfficeIds.length) {
			const exchangeOfficesFromDB = await this.exchangeOfficeRepository.find({
				where: {
					id: In(parsedExchangeOfficeIds),
				},
				relations: ["country"],
			});
			return exchangeOfficesFromDB.reduce((arr, exchangeOfficeFromDB) => {
				const foundParsedExchangeOffice = parsedExchangeOffices.find(
					(parsedExchangeOffice) =>
						(Number.isFinite(+parsedExchangeOffice.id) ? +parsedExchangeOffice.id : parsedExchangeOffice.id) ===
						exchangeOfficeFromDB.id
				);
				return [
					...arr,
					...foundParsedExchangeOffice[fieldName].map((dataItem: { [key: string]: any }) => ({
						...dataItem,
						exchangeOffice: exchangeOfficeFromDB,
					})),
				];
			}, []);
		}
		return [];
	}

	async saveEntity(data: NonNullable<unknown>[], repositoryName: string): Promise<void> {
		if (data.length) {
			const dataEntities = this[repositoryName].create(data);
			await this[repositoryName].save(dataEntities);
		}
	}

	getUSDCurrency(rateFromVal: string, rates: Rate[]): number {
		const usdRate = rates.find((rate) => rate.from === rateFromVal && rate.to === "USD");
		if (usdRate) {
			return +usdRate.out / +usdRate.in;
		}
		return 0;
	}

	async findCorrespondingRateAndSaveExchange(exchanges: Exchange[], alreadyPreparedRates: Rate[] = []): Promise<void> {
		const monthAgo = new Date();
		monthAgo.setMonth(monthAgo.getMonth() - 1);
		const rates = !alreadyPreparedRates.length
			? await this.rateRepository.find({
					where: {
						date: MoreThanOrEqual(monthAgo),
					},
			  })
			: alreadyPreparedRates;
		if (rates.length) {
			const sortedRates = rates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
			const exchangesWithRate = exchanges.map((exchange) => {
				const currentExchangeDate = new Date(exchange.date).getTime();
				const preparedRates = sortedRates
					.filter((rateItem) => rateItem.from === exchange.from && rateItem.to === exchange.to)
					.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
				if (preparedRates.length) {
					const closestRate = preparedRates.reduce((closest, currentItem) => {
						const timeDifference = Math.abs(new Date(currentItem.date).getTime() - currentExchangeDate);
						return timeDifference < Math.abs(new Date(closest.date).getTime() - currentExchangeDate)
							? currentItem
							: closest;
					}, preparedRates[0]);
					const usdCurrency = this.getUSDCurrency(exchange.to !== "USD" ? exchange.to : exchange.from, sortedRates);
					const calculatedBid: number = +exchange.bid || +exchange.ask / (+closestRate.out / +closestRate.in);
					const preparedAsk = closestRate.from === "USD" ? +exchange.ask * usdCurrency : +exchange.ask;
					const preparedBid = closestRate.from === "USD" ? calculatedBid : calculatedBid * usdCurrency;
					console.log(exchange, "current exchange");
					console.log(usdCurrency, "usdCurrency");
					console.log(preparedAsk, "preparedAsk", exchange.ask, "exchange.ask");
					console.log(preparedBid, "preparedBid", calculatedBid, "calculatedBid");
					return {
						...exchange,
						bid: calculatedBid,
						rate: closestRate,
					};
				}
				return {};
			});
			await this.saveEntity(
				exchangesWithRate.filter((item) => !!Object.keys(item).length),
				"exchangeRepository"
			);
		}
	}

	async saveDataToDB(data: NonNullable<unknown>): Promise<void> {
		const exchangeOffices = data["exchange-offices"];
		const { countries } = data as {
			countries: Country[];
		};
		await this.saveUniqueDataByField(countries, "countryRepository", "code");
		await this.saveUniqueDataByField(exchangeOffices, "exchangeOfficeRepository", "id", true);
		const [preparedRates, preparedExchanges] = await Promise.all([
			this.prepareDataWithExchangeOffice<Rate>(exchangeOffices, "rates"),
			this.prepareDataWithExchangeOffice<Exchange>(exchangeOffices, "exchanges"),
		]);
		await this.saveEntity(preparedRates, "rateRepository");
		await this.findCorrespondingRateAndSaveExchange(preparedExchanges);
	}

	async getTopCurrencyExchangers() {
		const currentDate = new Date();
		currentDate.setMonth(currentDate.getMonth() - 1);
		const foundExchangeOfficesForTheLastMonth = await this.exchangeOfficeRepository.find({
			relations: ["exchanges", "rates", "country"],
			where: {
				exchanges: {
					date: MoreThanOrEqual(currentDate),
				},
				rates: {
					date: MoreThanOrEqual(currentDate),
				},
			},
		});
		console.log(foundExchangeOfficesForTheLastMonth, "foundExchangeOfficesForTheLastMonth");
	}
}
