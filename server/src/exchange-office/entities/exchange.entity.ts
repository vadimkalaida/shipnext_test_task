import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { ExchangeOffice } from "./exchange-office.entity";
import { Rate } from "./rate.entity";

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

	@Column({ type: "real" })
	bid: string;

	@Column({ nullable: true, type: "real", default: 0 })
	profit: string;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	date: Date;

	@ManyToOne(() => ExchangeOffice, (exchangeOffice) => exchangeOffice.exchanges, { cascade: true })
	exchangeOffice: ExchangeOffice;

	@ManyToOne(() => Rate)
	@JoinColumn({ name: "rateId" })
	rate: Rate;
}
