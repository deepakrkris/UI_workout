import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm"

@Entity()
export class Game extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: string

    @Column()
    user1: string

    @Column()
    user2: string

    @Column()
    data: string

    @Column()
    winner: string
}
