import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { ExchangeOffice } from "./exchange-office.entity";

@Entity()
export class Rate {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	from: string;

	@Column()
	to: string;

	@Column()
	in: number;

	@Column()
	out: number;

	@Column()
	reserve: number;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	date: Date;

	@ManyToOne(() => ExchangeOffice, (exchangeOffice) => exchangeOffice.rates)
	exchangeOffice: ExchangeOffice;
}
