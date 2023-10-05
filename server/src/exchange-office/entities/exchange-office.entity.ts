import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany,
} from "typeorm";
import { Country } from "./country.entity";
import { Exchange } from "./exchange.entity";
import { Rate } from "./rate.entity";

@Entity()
export class ExchangeOffice {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@ManyToOne(() => Country, {
		onDelete: "CASCADE",
	})
	@JoinColumn({ name: "country", referencedColumnName: "code" })
	country: Country;

	@OneToMany(() => Exchange, (exchange) => exchange.exchangeOffice)
	exchanges: Exchange[];

	@OneToMany(() => Rate, (rate) => rate.exchangeOffice)
	rates: Exchange[];

	@CreateDateColumn()
	created: Date;

	@UpdateDateColumn()
	updated: Date;
}
