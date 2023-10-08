import { ExchangeOffice } from "./entities/exchange-office.entity";
import { Exchange } from "./entities/exchange.entity";
import { Rate } from "./entities/rate.entity";
import { Country } from "./entities/country.entity";

class ExchangeOfficeTopCurrencyExchangers extends ExchangeOffice {
	countrycode: string;

	countryname: string;

	countrytotalprofit: string;
}

interface IExchangeOfficeTopCurrencyExchangersResponse {
	name: string;
	countryTotalProfit: number;
	code: string;
	exchangeOffices: ExchangeOffice[];
}

export {
	ExchangeOffice,
	Exchange,
	Rate,
	Country,
	ExchangeOfficeTopCurrencyExchangers,
	IExchangeOfficeTopCurrencyExchangersResponse,
};
