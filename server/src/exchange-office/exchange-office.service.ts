import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In, MoreThanOrEqual } from "typeorm";
import {
	ExchangeOffice,
	Exchange,
	Rate,
	Country,
	ExchangeOfficeTopCurrencyExchangers,
	IExchangeOfficeTopCurrencyExchangersResponse,
} from "./exchange-office.types";

@Injectable()
export class ExchangeOfficeService {
	readonly BASE_CURRENCY = "USD";

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
		const usdRate = rates.find((rate) => rate.from === rateFromVal && rate.to === this.BASE_CURRENCY);
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
					const usdCurrency = this.getUSDCurrency(
						exchange.to !== this.BASE_CURRENCY ? exchange.to : exchange.from,
						sortedRates
					);
					const calculatedBid: number = +exchange.bid || +exchange.ask / (+closestRate.out / +closestRate.in);
					const preparedAsk = closestRate.from === this.BASE_CURRENCY ? +exchange.ask * usdCurrency : +exchange.ask;
					const preparedBid = closestRate.from === this.BASE_CURRENCY ? calculatedBid : calculatedBid * usdCurrency;
					const exchangeProfit = Math.abs(preparedAsk - preparedBid);
					return {
						...exchange,
						bid: calculatedBid,
						rate: closestRate,
						profit: exchangeProfit,
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

	prepareExchangeOfficesToReturn(
		foundExchangeOffices: ExchangeOfficeTopCurrencyExchangers[]
	): IExchangeOfficeTopCurrencyExchangersResponse[] {
		const prepared = foundExchangeOffices.reduce((obj, exchangeOfficeItem) => {
			const { countrycode, countryname, countrytotalprofit, ...rest } = exchangeOfficeItem;
			const foundCountry = obj[countrycode];
			if (foundCountry) {
				obj[countrycode] = {
					...foundCountry,
					exchangeOffices: [...foundCountry.exchangeOffices, { ...rest }],
				};
			} else {
				obj[countrycode] = {
					name: countryname,
					countryTotalProfit: countrytotalprofit,
					code: countrycode,
					exchangeOffices: [{ ...rest }],
				};
			}
			return obj;
		}, {});
		return Object.values(prepared);
	}

	async getTopCurrencyExchangers() {
		const lastMonthDate = new Date();
		lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
		const sql = `
			WITH RankedExchangeOffices AS (
				SELECT
					eo.*,
					json_agg(json_build_object(
						'id', e.id,
						'from', e.from,
						'to', e.to,
						'ask', e.ask,
						'bid', e.bid,
						'date', e.date,
						'profit', e.profit
						)) AS exchanges,
					json_agg(json_build_object(
						'id', r.id,
						'from', r.from,
						'to', r.to,
						'in', r.in,
						'out', r.out,
						'reserve', r.reserve,
						'date', r.date
						)) AS rates,
				    c.name AS countryName,
					SUM(e.profit) AS totalProfit,
					ROW_NUMBER() OVER (PARTITION BY eo.country ORDER BY SUM(e.profit) DESC) AS officeRank
				FROM exchange_office eo
				LEFT JOIN exchange e ON eo.id = e."exchangeOfficeId"
				LEFT JOIN rate r ON e."rateId" = r.id
				LEFT JOIN country c ON eo.country = c.code
				WHERE e.date >= $1
				GROUP BY eo.id, eo.country, c.name
			),
			 RankedCountries AS (
				 SELECT
					 eo.country AS country,
					 SUM(eo.totalProfit) AS countryTotalProfit
				 FROM RankedExchangeOffices eo
				 GROUP BY eo.country
			 )
			SELECT
				reo.id,
				reo.name,
				reo.country as countryCode,
				reo.countryName,
				reo.exchanges,
				reo.rates,
				reo.totalProfit,
				rc.countryTotalProfit
			FROM RankedExchangeOffices reo
						 JOIN RankedCountries rc ON reo.country = rc.country
			WHERE reo.officeRank <= 3
			ORDER BY rc.countryTotalProfit DESC, reo.officeRank;
		`;
		const foundExchangeOfficesForTheLastMonth = await this.exchangeOfficeRepository.query(sql, [lastMonthDate]);
		return this.prepareExchangeOfficesToReturn(foundExchangeOfficesForTheLastMonth);
	}
}
