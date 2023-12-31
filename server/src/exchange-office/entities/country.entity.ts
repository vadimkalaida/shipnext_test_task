import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";

@Entity()
@Unique(["code"])
export class Country {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	code: string;
}
