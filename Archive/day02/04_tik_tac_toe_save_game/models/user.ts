import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm"

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    username: string

    @Column()
    numberOfGames: number

    @Column()
    wins: number
}
