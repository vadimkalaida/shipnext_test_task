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

	@Column({ type: "real" })
	ask: string;

	@Column({ nullable: true, type: "real" })
	bid: string;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	date: Date;

	@ManyToOne(() => ExchangeOffice, (exchangeOffice) => exchangeOffice.exchanges, { cascade: true })
	exchangeOffice: ExchangeOffice;
}
