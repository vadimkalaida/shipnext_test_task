import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { ExchangeOffice } from "./exchange-office.entity";

@Entity()
export class Exchange {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	from: string;

	@Column()
	to: string;

	@Column()
	ask: number;

	@Column({ nullable: true })
	bid: number;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	date: Date;

	@ManyToOne(() => ExchangeOffice, (exchangeOffice) => exchangeOffice.exchanges)
	exchangeOffice: ExchangeOffice;
}
