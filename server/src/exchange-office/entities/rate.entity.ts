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

	@Column({ type: "real" })
	in: string;

	@Column({ type: "real" })
	out: string;

	@Column({ type: "real" })
	reserve: string;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	date: Date;

	@ManyToOne(() => ExchangeOffice, (exchangeOffice) => exchangeOffice.rates, { cascade: true })
	exchangeOffice: ExchangeOffice;
}
